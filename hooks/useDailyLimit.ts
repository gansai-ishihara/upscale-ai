import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/stores/appStore';
import { APP_CONFIG } from '@/constants/config';

const STORAGE_KEY = 'upscale_daily_count';

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function useDailyLimit() {
  const { isPro } = useAppStore();
  const [count, setCount] = useState(0);
  const limit = APP_CONFIG.FREE_DAILY_LIMIT;

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === getTodayKey()) {
          setCount(data.count);
        } else {
          // New day, reset
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), count: 0 }));
          setCount(0);
        }
      }
    } catch {
      setCount(0);
    }
  };

  const incrementCount = useCallback(async () => {
    const newCount = count + 1;
    setCount(newCount);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), count: newCount }));
  }, [count]);

  const remaining = Math.max(0, limit - count);
  const canProcess = isPro || remaining > 0;

  return { count, remaining, limit, canProcess, incrementCount };
}
