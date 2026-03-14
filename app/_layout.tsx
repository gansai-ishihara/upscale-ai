import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/constants/i18n';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // ATT → AdMob 初期化 (ATTダイアログを先に表示してからAdMobを初期化)
  const { setTrackingAllowed } = useAppStore();
  useEffect(() => {
    async function initAds() {
      const { status } = await requestTrackingPermissionsAsync();
      setTrackingAllowed(status === 'granted');
      await mobileAds().initialize();
    }
    initAds();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="process"
          options={{
            title: t('screen.process'),
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: t('screen.result'),
            presentation: 'card',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
