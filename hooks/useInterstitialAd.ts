import { useEffect, useRef, useCallback, useMemo } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '@/constants/ads';
import { useAppStore } from '@/stores/appStore';

const SHOW_EVERY_N = 2; // 2回に1回表示

export function useInterstitialAd() {
  const { isPro, trackingAllowed } = useAppStore();
  const processCount = useRef(0);
  const loaded = useRef(false);

  const interstitial = useMemo(
    () =>
      InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: !trackingAllowed,
      }),
    [trackingAllowed],
  );

  useEffect(() => {
    if (isPro) return;

    loaded.current = false;

    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loaded.current = true;
    });

    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loaded.current = false;
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, [isPro, interstitial]);

  const showIfReady = useCallback(() => {
    if (isPro) return;

    processCount.current += 1;
    if (processCount.current % SHOW_EVERY_N !== 0) return;

    if (loaded.current) {
      interstitial.show();
    }
  }, [isPro, interstitial]);

  return { showIfReady };
}
