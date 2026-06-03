import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';

// Screens
import CustomerDashboardScreen from '../screens/CustomerDashboard';
import ArtisanDashboardScreen from '../screens/ArtisanDashboard';
import VerificationFlowScreen from '../screens/VerificationFlow';

// --- Tab Icon Component ---
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Jobs: '📋',
    Earnings: '💰',
    Profile: '👤',
    Verify: '✅',
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Customer Tab Navigator ---
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
        name="Verify"
        component={VerificationFlowScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Verify" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// --- Artisan Tab Navigator ---
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
        name="ArtisanProfile"
        component={ArtisanDashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// --- Root Navigator ---
// In production, this would read the user role from SecureStore/auth state
// and render either CustomerTabs or ArtisanTabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Default to Customer view for now — role-based routing wired to auth state */}
        <Stack.Screen name="CustomerApp" component={CustomerTabs} />
        <Stack.Screen name="ArtisanApp" component={ArtisanTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
