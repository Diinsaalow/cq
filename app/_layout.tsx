import { Fragment, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  console.log('Segments', segments);

  useEffect(() => {
    const isLoginRoute = segments[0] === 'login';

    if (!isAuthenticated && !isLoginRoute) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && isLoginRoute) {
      // Redirect to home if authenticated and trying to access login page
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  useFrameworkReady();

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="section/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="player" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </Fragment>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
