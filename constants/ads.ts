import { Platform } from 'react-native';

// テスト用広告ユニットID (本番リリース前に差し替え)
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';

export const AD_UNITS = {
  BANNER: Platform.select({
    ios: TEST_BANNER_IOS,
    android: TEST_BANNER_ANDROID,
  }) ?? TEST_BANNER_IOS,

  INTERSTITIAL: Platform.select({
    ios: TEST_INTERSTITIAL_IOS,
    android: TEST_INTERSTITIAL_ANDROID,
  }) ?? TEST_INTERSTITIAL_IOS,
} as const;
