import { Fragment, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import MiniPlayer from '../components/MiniPlayer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import getColors from '../constants/Colors';

function RootLayoutNav() {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      setIsInitialized(true);
    }
  }, [isAuthLoading]);

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthRoute = segments[0] === 'login' || segments[0] === 'signup';

    if (!isAuthenticated && !isAuthRoute) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && isAuthRoute) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/');
    }
  }, [isAuthenticated, segments, isInitialized]);

  useFrameworkReady();

  // Don't show mini player on the player screen or auth screens
  const showMiniPlayer =
    isAuthenticated &&
    segments[0] !== 'player' &&
    segments[0] !== 'login' &&
    segments[0] !== 'signup';

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="section/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="player" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {showMiniPlayer && <MiniPlayer />}
    </Fragment>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
