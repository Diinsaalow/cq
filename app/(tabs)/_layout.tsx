import React from 'react';
import { Tabs } from 'expo-router';
import Colors from '../../constants/Colors';
import { Home, Music, Upload, User } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { username, role } = useAuth();

  // Check if user is admin based on their role
  const isAdmin = role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
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
