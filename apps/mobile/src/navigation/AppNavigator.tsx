import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// App screens
import CustomerDashboardScreen from '../screens/CustomerDashboard';
import ArtisanDashboardScreen from '../screens/ArtisanDashboard';
import VerificationFlowScreen from '../screens/VerificationFlow';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import BookingScreen from '../screens/BookingScreen';

// Auth context
import { useAuth } from '../context/AuthContext';

// ─── Navigator param list types ───────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: { phoneNumber: string; email: string };
};

export type CustomerStackParamList = {
  CustomerHome: undefined;
  Profile: undefined;
  Booking: { artisanId: string; artisanName: string; categorySlug?: string };
  Chat: { bookingId: string; otherPersonName: string; otherPersonId: string };
};

export type ArtisanStackParamList = {
  ArtisanHome: undefined;
  Verify: undefined;
  ArtisanProfile: undefined;
  Chat: { bookingId: string; otherPersonName: string; otherPersonId: string };
};

// ─── Stacks & Tabs ────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const ArtisanStack = createNativeStackNavigator<ArtisanStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Tab Icon ─────────────────────────────────────────────────────────────────

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Jobs: '📋', Earnings: '💰', Profile: '👤', Verify: '✅',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>{icons[name] || '•'}</Text>
      <Text style={{ fontSize: 10, color: focused ? '#007A52' : '#9CA3AF', fontWeight: focused ? '700' : '400', marginTop: 2 }}>
        {name}
      </Text>
    </View>
  );
}

// ─── Auth Navigator ──────────────────────────────────────────────────────────

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Customer Stack (with tab navigator inside) ───────────────────────────────

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="CustomerHome"
        component={CustomerDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="CustomerProfile"
        component={CustomerProfileWrapper}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

function CustomerProfileWrapper() {
  return <ProfileScreen />;
}

function CustomerNavigator() {
  return (
    <CustomerStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="CustomerHome" component={CustomerTabs} />
      <CustomerStack.Screen
        name="Booking"
        component={({ route, navigation }: any) => (
          <BookingScreen
            artisanId={route.params.artisanId}
            artisanName={route.params.artisanName}
            categorySlug={route.params.categorySlug}
            onSuccess={() => navigation.goBack()}
            onCancel={() => navigation.goBack()}
          />
        )}
      />
      <CustomerStack.Screen
        name="Chat"
        component={({ route, navigation }: any) => (
          <ChatScreen
            bookingId={route.params.bookingId}
            otherPersonName={route.params.otherPersonName}
            otherPersonId={route.params.otherPersonId}
            onBack={() => navigation.goBack()}
          />
        )}
      />
      <CustomerStack.Screen name="Profile" component={CustomerProfileWrapper} />
    </CustomerStack.Navigator>
  );
}

// ─── Artisan Stack ────────────────────────────────────────────────────────────

function ArtisanTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D2B5E',
          borderTopColor: '#1E3A6E',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="ArtisanHome"
        component={ArtisanDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="Jobs"
        component={ArtisanDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Jobs" focused={focused} /> }}
      />
      <Tab.Screen
        name="Earnings"
        component={ArtisanDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Earnings" focused={focused} /> }}
      />
      <Tab.Screen
        name="ArtisanProfileTab"
        component={ArtisanProfileWrapper}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

function ArtisanProfileWrapper() {
  return <ProfileScreen />;
}

function ArtisanNavigator() {
  return (
    <ArtisanStack.Navigator screenOptions={{ headerShown: false }}>
      <ArtisanStack.Screen name="ArtisanHome" component={ArtisanTabs} />
      <ArtisanStack.Screen name="Verify" component={VerificationFlowScreen} />
      <ArtisanStack.Screen
        name="Chat"
        component={({ route, navigation }: any) => (
          <ChatScreen
            bookingId={route.params.bookingId}
            otherPersonName={route.params.otherPersonName}
            otherPersonId={route.params.otherPersonId}
            onBack={() => navigation.goBack()}
          />
        )}
      />
      <ArtisanStack.Screen name="ArtisanProfile" component={ArtisanProfileWrapper} />
    </ArtisanStack.Navigator>
  );
}

// ─── Root Navigator — Auth-aware ──────────────────────────────────────────────

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D2B5E', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#007A52', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff' }}>S</Text>
        </View>
        <ActivityIndicator color="#007A52" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'ARTISAN' ? (
        <ArtisanNavigator />
      ) : (
        <CustomerNavigator />
      )}
    </NavigationContainer>
  );
}
