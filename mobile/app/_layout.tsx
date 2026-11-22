import { MarketProvider } from '@/components/market/MarketProvider';
import { colors } from '@/constants/theme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <MarketProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.purple,
          headerStyle: { backgroundColor: colors.card },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Log in' }} />
        <Stack.Screen name="signup" options={{ title: 'Sign up' }} />
        <Stack.Screen name="book/[category]" options={{ title: 'Book' }} />
        <Stack.Screen
          name="book/pros/[serviceId]"
          options={{ title: 'Pros' }}
        />
        <Stack.Screen
          name="book/when/[proId]/[serviceId]"
          options={{ title: 'When' }}
        />
        <Stack.Screen
          name="book/where/[proId]/[serviceId]"
          options={{ title: 'Where' }}
        />
        <Stack.Screen name="book/pay" options={{ title: 'Pay' }} />
        <Stack.Screen
          name="book/confirmation/[id]"
          options={{ title: 'Confirmed', headerBackVisible: false }}
        />
        <Stack.Screen
          name="bookings/[id]"
          options={{ title: 'Tracking' }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{ title: 'Chat' }}
        />
        <Stack.Screen name="pro/index" options={{ title: 'Pro' }} />
        <Stack.Screen name="pro/join" options={{ title: 'Become a pro' }} />
        <Stack.Screen
          name="pro/onboarding"
          options={{ title: 'Onboarding', headerShown: false }}
        />
        <Stack.Screen
          name="pro/dashboard"
          options={{ title: 'Dashboard', headerShown: false }}
        />
        <Stack.Screen name="pro/hours" options={{ title: 'Hours', headerShown: false }} />
        <Stack.Screen name="pro/payouts" options={{ title: 'Payouts' }} />
        <Stack.Screen
          name="pro/bookings/[id]"
          options={{ title: 'Booking' }}
        />
      </Stack>
    </MarketProvider>
  );
}
