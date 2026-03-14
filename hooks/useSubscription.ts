import { useEffect, useCallback } from 'react';
import { useIAP } from 'expo-iap';
import { useAppStore } from '@/stores/appStore';
import { IAP } from '@/constants/config';

export function useSubscription() {
  const { setIsPro } = useAppStore();

  const {
    connected,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransaction({ purchase, isConsumable: false });
        setIsPro(true);
      } catch (error) {
        console.warn('Finish transaction failed:', error);
        await finishTransaction({ purchase, isConsumable: false });
      }
    },
    onPurchaseError: (error) => {
      if (error.code !== 'UserCancelled') {
        console.warn('Purchase error:', error);
      }
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [IAP.PRODUCT_ID], type: 'in-app' });
      checkPurchased();
    }
  }, [connected]);

  const checkPurchased = useCallback(async () => {
    try {
      const purchases = await getAvailablePurchases();
      const hasPro = purchases.some((p) => p.productId === IAP.PRODUCT_ID);
      setIsPro(hasPro);
    } catch {
      // Offline or error - keep current state
    }
  }, [connected]);

  const purchase = useCallback(async () => {
    await requestPurchase({
      request: {
        apple: { sku: IAP.PRODUCT_ID },
      },
      type: 'in-app',
    });
  }, [connected]);

  const restore = useCallback(async () => {
    await checkPurchased();
  }, [connected]);

  return { purchase, restore, checkPurchased };
}
