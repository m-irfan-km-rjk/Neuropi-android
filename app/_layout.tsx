import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scheduler" />
      <Stack.Screen name="aac" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="games" />
    </Stack>
  );
}
