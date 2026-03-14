export const APP_CONFIG = {
  APP_NAME: 'UpScale AI',
  BUNDLE_ID: 'com.gansai.upscale-ai',
  FREE_DAILY_LIMIT: 3,
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi'],
  MAX_VIDEO_DURATION_SECONDS: 60,
  TILE_SIZE: 256,
  TILE_OVERLAP: 16,
  BATCH_SIZE: 4,
} as const;

export const REVENUECAT = {
  API_KEY: 'appl_xxxxx', // RevenueCatダッシュボードから取得
  ENTITLEMENT_ID: 'pro',
  PRODUCT_IDS: {
    monthly: 'upscale_ai_pro_monthly',  // ¥480/月
    yearly: 'upscale_ai_pro_yearly',    // ¥3,800/年
  },
} as const;

export const UPSCALE_OPTIONS = {
  scales: [2, 4] as const,
  defaultScale: 2 as const,
};
