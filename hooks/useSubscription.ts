import { useEffect, useCallback } from 'react';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useAppStore } from '@/stores/appStore';
import { REVENUECAT } from '@/constants/config';

export function useSubscription() {
  const { setIsPro } = useAppStore();

  useEffect(() => {
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    try {
      Purchases.configure({ apiKey: REVENUECAT.API_KEY });
      await checkSubscription();
    } catch (e) {
      console.warn('RevenueCat init failed:', e);
    }
  };

  const checkSubscription = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isActive = customerInfo.entitlements.active[REVENUECAT.ENTITLEMENT_ID] !== undefined;
      setIsPro(isActive);
    } catch {
      // Offline or error - keep current state
    }
  };

  const purchaseMonthly = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const monthly = offerings.current?.monthly;
      if (monthly) {
        await Purchases.purchasePackage(monthly);
        await checkSubscription();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        throw e;
      }
    }
  }, []);

  const purchaseYearly = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const annual = offerings.current?.annual;
      if (annual) {
        await Purchases.purchasePackage(annual);
        await checkSubscription();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        throw e;
      }
    }
  }, []);

  const restore = useCallback(async () => {
    await Purchases.restorePurchases();
    await checkSubscription();
  }, []);

  return { purchaseMonthly, purchaseYearly, restore, checkSubscription };
}
