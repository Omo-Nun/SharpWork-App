import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const BRAND = {
  green: '#007A52',
  navy: '#0D2B5E',
  orange: '#F56500',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
};

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChatScreenProps {
  bookingId: string;
  otherPersonName: string;
  otherPersonId: string;
  onBack: () => void;
}

export default function ChatScreen({ bookingId, otherPersonName, otherPersonId, onBack }: ChatScreenProps) {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history
  useEffect(() => {
    if (!token || !bookingId) return;
    (async () => {
      try {
        const res = await axios.get<{ messages: Message[] }>(
          `${API_URL}/api/booking/${bookingId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || []);
      } catch {
        // Fallback to empty — socket will populate live messages
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !bookingId) return;

    socket.emit('join:booking', bookingId);

    const handleMessage = (payload: Message) => {
      setMessages((prev) => {
        // Prevent duplicate if it's our own optimistic message that came back
        if (prev.some((m) => m.id === payload.id)) return prev;
        
        // Remove optimistic temp message if we get the real one
        // Wait, the real message will have a real uuid. Our optimistic one has `tmp_`.
        // We can just rely on the real message arriving, but wait! The sender doesn't receive their own message broadcast because io.to() sends to everyone including sender... yes it does unless using broadcast.to(). Let's assume it sends to sender too.
        // Actually, just to be safe, filter out any tmp message with the same content if the sender is us? 
        // A better approach is to let the REST API return the real message id, and update the tmp id. But we use socket.emit now.
        return [...prev.filter(m => !(m.id.startsWith('tmp_') && m.content === payload.content)), payload];
      });
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket, bookingId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || sending || !token || !socket || !isConnected) return;
    const content = text.trim();
    setText('');
    setSending(true);

    // Optimistic update
    const optimistic: Message = {
      id: `tmp_${Date.now()}`,
      senderId: user?.id || '',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      socket.emit('chat:message', {
        bookingId,
        receiverId: otherPersonId,
        content,
      });
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content); // restore input
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp: string) {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.msgWrapper, isMine ? styles.msgRight : styles.msgLeft]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{otherPersonName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherPersonName}</Text>
            <Text style={styles.headerSub}>{isConnected ? 'Active booking • Online' : 'Connecting...'}</Text>
          </View>
        </View>
        <View style={[styles.onlineDot, { backgroundColor: isConnected ? BRAND.green : BRAND.gray400 }]} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator color={BRAND.green} size="large" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item: Message) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatIcon}>💬</Text>
                <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.gray400}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color={BRAND.white} size="small" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BRAND.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.gray100,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: { marginRight: 12, padding: 4 },
  backIcon: { fontSize: 22, color: BRAND.navy, fontWeight: '700' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: BRAND.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: BRAND.white, fontSize: 16, fontWeight: '900' },
  headerName: { fontSize: 16, fontWeight: '800', color: BRAND.navy },
  headerSub: { fontSize: 12, color: BRAND.green, fontWeight: '600', marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.green, borderWidth: 2, borderColor: BRAND.white },
  loadingArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  emptyChat: { alignItems: 'center', paddingTop: 80 },
  emptyChatIcon: { fontSize: 48, marginBottom: 16 },
  emptyChatText: { color: BRAND.gray400, fontSize: 15, fontWeight: '500' },
  msgWrapper: { marginBottom: 10, maxWidth: '80%' },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  bubbleMine: { backgroundColor: BRAND.green, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: BRAND.white, borderBottomLeftRadius: 6, borderWidth: 1, borderColor: BRAND.gray200 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { color: BRAND.white },
  bubbleTextTheirs: { color: BRAND.navy },
  timestamp: { fontSize: 10, marginTop: 4, fontWeight: '600' },
  timestampMine: { color: 'rgba(255,255,255,0.65)', textAlign: 'right' },
  timestampTheirs: { color: BRAND.gray400 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BRAND.white,
    borderTopWidth: 1,
    borderTopColor: BRAND.gray100,
    gap: 10,
  },
  textInput: { flex: 1, borderWidth: 1.5, borderColor: BRAND.gray200, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: BRAND.navy, maxHeight: 120, backgroundColor: BRAND.gray50 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: BRAND.green, alignItems: 'center', justifyContent: 'center', shadowColor: BRAND.green, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  sendBtnDisabled: { backgroundColor: BRAND.gray300, shadowOpacity: 0 },
  sendIcon: { color: BRAND.white, fontSize: 20, fontWeight: '900' },
});
