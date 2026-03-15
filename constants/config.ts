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
} as const;

export const LEGAL_URLS = {
  PRIVACY: 'https://gansai-ishihara.github.io/upscale-ai/privacy',
  TERMS: 'https://gansai-ishihara.github.io/upscale-ai/terms',
} as const;

export const OUTPUT_RESOLUTIONS = [
  { label: '720p', height: 720 },
  { label: '1080p', height: 1080 },
  { label: '4K', height: 2160 },
] as const;

export type OutputResolutionHeight = typeof OUTPUT_RESOLUTIONS[number]['height'];
