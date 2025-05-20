import React from 'react';
import { Tabs } from 'expo-router';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Music, Upload, User } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { role } = useAuth();
  const { theme } = useTheme();
  const colors = getColors(theme);

  // Check if user is admin based on their role
  const isAdmin = role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.shadow,
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <Music size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={
          isAdmin
            ? {
                title: 'Admin',
                tabBarIcon: ({ color }) => <Upload size={24} color={color} />,
              }
            : { href: null }
        }
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
