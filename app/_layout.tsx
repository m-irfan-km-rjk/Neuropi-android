import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scheduler" />
      <Stack.Screen name="aac" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="emotion_selection" />
      <Stack.Screen name="emotion_practice" />
      <Stack.Screen name="games" />
      <Stack.Screen name="memory_match" />
      <Stack.Screen name="routine_builder" />
      <Stack.Screen name="smart_bubble" />
      <Stack.Screen name="visual_real_life" />
    </Stack>
  );
}
