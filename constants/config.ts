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

export const IAP = {
  PRODUCT_ID: 'upscale_ai_pro', // App Store Connectで設定する非消耗型プロダクトID
  PRICE: '¥480',
} as const;

export const LEGAL_URLS = {
  PRIVACY: 'https://gansai-ishihara.github.io/upscale-ai/privacy',
  TERMS: 'https://gansai-ishihara.github.io/upscale-ai/terms',
} as const;

export const UPSCALE_OPTIONS = {
  scales: [2, 4] as const,
  defaultScale: 2 as const,
};
