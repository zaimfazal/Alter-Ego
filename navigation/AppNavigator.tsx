import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../store/useAppStore';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MissionsScreen from '../screens/MissionsScreen';
import AlterEgoScreen from '../screens/AlterEgoScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Theme
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { Shield, Target, MessageSquare, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surfaceContainerLowest },
        headerTintColor: COLORS.onSurface,
        headerTitleStyle: { fontFamily: TYPOGRAPHY.headline },
        tabBarStyle: {
          backgroundColor: COLORS.surfaceContainerLowest,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: COLORS.primaryFixed,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Shield color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Missions" 
        component={MissionsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Target color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Alter Ego" 
        component={AlterEgoScreen} 
        options={{
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { hasOnboarded } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
