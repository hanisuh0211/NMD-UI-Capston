import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'JejuSamdasooBrand-Regular': require('../assets/fonts/JejuSamdasooBrand-Regular.otf'),
    'JejuSamdasooBrand-Bold': require('../assets/fonts/JejuSamdasooBrand-Bold.otf'),
    'JejuSamdasuSpecial': require('../assets/fonts/JejuSamdasuSpecial.otf'),
    'AVALADO-Sick': require('../assets/fonts/AVALADO-Sick.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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
