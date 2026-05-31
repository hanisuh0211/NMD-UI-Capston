import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="loading" />
      <Stack.Screen name="signup/step1" />
      <Stack.Screen name="signup/step2" />
      <Stack.Screen name="signup/step3" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
