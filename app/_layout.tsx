import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scheduler" />
      <Stack.Screen name="emotion_selection" />
      <Stack.Screen name="emotion_practice" />
    </Stack>
  );
}
