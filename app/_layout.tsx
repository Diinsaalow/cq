import { Fragment, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <Fragment
    //@ts-ignore
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="section/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </Fragment>
  );
}
