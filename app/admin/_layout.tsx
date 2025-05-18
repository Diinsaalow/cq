import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="content" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="section/[id]" />
    </Stack>
  );
}
