import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/stores/appStore';
import { APP_CONFIG } from '@/constants/config';

const STORAGE_KEY = 'upscale_daily_count';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function useDailyLimit() {
  const { isPro, dailyCount, dailyDate, setDailyCount } = useAppStore();
  const limit = APP_CONFIG.FREE_DAILY_LIMIT;

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    try {
      const today = getTodayKey();
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === today) {
          setDailyCount(data.count, today);
        } else {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
          setDailyCount(0, today);
        }
      } else {
        setDailyCount(0, today);
      }
    } catch {
      setDailyCount(0, getTodayKey());
    }
  };

  const incrementCount = useCallback(async () => {
    const today = getTodayKey();
    const currentCount = useAppStore.getState().dailyCount;
    const newCount = currentCount + 1;
    setDailyCount(newCount, today);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  }, [setDailyCount]);

  const remaining = Math.max(0, limit - dailyCount);
  const canProcess = isPro || remaining > 0;

  return { count: dailyCount, remaining, limit, canProcess, incrementCount };
}
