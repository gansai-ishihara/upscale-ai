import { useMemo } from 'react';
import { getLocales } from 'expo-localization';

const translations = {
  ja: {
    // Tab labels
    'tab.home': 'ホーム',
    'tab.history': '履歴',
    'tab.settings': '設定',

    // Screen titles
    'screen.process': '処理設定',
    'screen.result': '処理結果',

    // Home screen
    'home.permissionRequired': 'フォトライブラリへのアクセス許可が必要です',
    'home.dailyRemaining': '今日あと {{remaining}}/{{limit}} 回',
    'home.pickVideo': '動画を選択',
    'home.pickSubtitle': 'タップしてフォトライブラリから選択',
    'home.pickFormats': 'MP4 / MOV / AVI対応',
    'home.recentHistory': '最近の処理',

    // History screen
    'history.empty': '処理履歴がありません',
    'history.emptySubtext': '動画を超解像処理すると\nここに履歴が表示されます',
    'history.count': '{{count}}件の処理',
    'history.clearAll': '全て削除',
    'history.clearTitle': '履歴を削除',
    'history.clearMessage': '全ての処理履歴を削除しますか？',
    'history.cancel': 'キャンセル',
    'history.delete': '削除',
    'history.minuteShort': '分',
    'history.secondShort': '秒',

    // Settings screen
    'settings.subscription': 'サブスクリプション',
    'settings.proActive': 'Pro プラン利用中',
    'settings.upgradePro': 'Pro にアップグレード',
    'settings.upgradePrice': '',
    'settings.restore': '購入を復元',
    'settings.restoreSuccess': '復元完了',
    'settings.restoreSuccessMsg': '購入情報を復元しました',
    'settings.restoreError': 'エラー',
    'settings.restoreErrorMsg': '購入情報の復元に失敗しました',
    'settings.legal': '法的情報',
    'settings.terms': '利用規約',
    'settings.privacy': 'プライバシーポリシー',
    'settings.licenses': 'オープンソースライセンス',
    'settings.licensesTitle': 'ライセンス',
    'settings.licensesBody': 'Real-ESRGAN © Xintao Wang\nBSD 3-Clause License\n\n本アプリはReal-ESRGANを使用した超解像処理を行っています。',
    'settings.about': 'アプリ情報',
    'settings.version': 'バージョン',
    'settings.footer': 'UpScale AI - AI動画超解像',

    // Process screen
    'process.videoSelected': '動画を選択済み',
    'process.settings': '設定',
    'process.scaleFactor': '出力解像度',
    'process.denoise': 'ノイズ除去',
    'process.denoiseDesc': 'AI生成ノイズを軽減',
    'process.sharpen': 'シャープネス強化',
    'process.sharpenDesc': '輪郭をくっきり補正',
    'process.colorEnhance': '色補正 (SNS最適化)',
    'process.colorEnhanceDesc': 'SNS投稿に最適な色味に調整',
    'process.cancel': '処理を中止',
    'process.start': '処理開始',
    'process.limitRemaining': '残り {{remaining}} 回 (Proで無制限)',
    'process.limitReached': '制限に達しました',
    'process.limitReachedMsg': '今日の無料枠を使い切りました。Proプランにアップグレードすると無制限に利用できます。',
    'process.error': 'エラー',
    'process.errorMsg': '処理中にエラーが発生しました。もう一度お試しください。',

    // Result screen
    'result.noResult': '処理結果がありません',
    'result.goBack': '戻る',
    'result.complete': '処理完了',
    'result.saveToCameraRoll': 'カメラロールに保存',
    'result.share': '共有',
    'result.goHome': 'ホームに戻る',
    'result.saveError': 'エラー',
    'result.savePermission': 'カメラロールへのアクセス許可が必要です',
    'result.saveSuccess': '保存完了',
    'result.saveSuccessMsg': 'カメラロールに保存しました',

    // Paywall
    'paywall.subtitle': '買い切りで全機能をアンロック',
    'paywall.featureUnlimited': '無制限の動画処理',
    'paywall.featureNoAds': '広告を完全削除',
    'paywall.purchaseLabel': '買い切り・追加料金なし',
    'paywall.terms': '利用規約',
    'paywall.privacy': 'プライバシーポリシー',
  },
  en: {
    // Tab labels
    'tab.home': 'Home',
    'tab.history': 'History',
    'tab.settings': 'Settings',

    // Screen titles
    'screen.process': 'Processing',
    'screen.result': 'Result',

    // Home screen
    'home.permissionRequired': 'Photo library access is required',
    'home.dailyRemaining': '{{remaining}}/{{limit}} remaining today',
    'home.pickVideo': 'Select Video',
    'home.pickSubtitle': 'Tap to choose from your library',
    'home.pickFormats': 'MP4 / MOV / AVI supported',
    'home.recentHistory': 'Recent',

    // History screen
    'history.empty': 'No processing history',
    'history.emptySubtext': 'Upscaled videos will\nappear here',
    'history.count': '{{count}} items',
    'history.clearAll': 'Clear All',
    'history.clearTitle': 'Clear History',
    'history.clearMessage': 'Delete all processing history?',
    'history.cancel': 'Cancel',
    'history.delete': 'Delete',
    'history.minuteShort': 'm',
    'history.secondShort': 's',

    // Settings screen
    'settings.subscription': 'Subscription',
    'settings.proActive': 'Pro Plan Active',
    'settings.upgradePro': 'Upgrade to Pro',
    'settings.upgradePrice': '',
    'settings.restore': 'Restore Purchase',
    'settings.restoreSuccess': 'Restored',
    'settings.restoreSuccessMsg': 'Your purchase has been restored',
    'settings.restoreError': 'Error',
    'settings.restoreErrorMsg': 'Failed to restore purchase',
    'settings.legal': 'Legal',
    'settings.terms': 'Terms of Service',
    'settings.privacy': 'Privacy Policy',
    'settings.licenses': 'Open Source Licenses',
    'settings.licensesTitle': 'Licenses',
    'settings.licensesBody': 'Real-ESRGAN © Xintao Wang\nBSD 3-Clause License\n\nThis app uses Real-ESRGAN for video super-resolution.',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.footer': 'UpScale AI - AI Video Upscaler',

    // Process screen
    'process.videoSelected': 'Video selected',
    'process.settings': 'Settings',
    'process.scaleFactor': 'Output Resolution',
    'process.denoise': 'Denoise',
    'process.denoiseDesc': 'Reduce AI-generated noise',
    'process.sharpen': 'Sharpen',
    'process.sharpenDesc': 'Enhance edge clarity',
    'process.colorEnhance': 'Color Correction (SNS)',
    'process.colorEnhanceDesc': 'Optimize colors for social media',
    'process.cancel': 'Cancel',
    'process.start': 'Start Processing',
    'process.limitRemaining': '{{remaining}} left (unlimited with Pro)',
    'process.limitReached': 'Limit Reached',
    'process.limitReachedMsg': "You've used all free processing for today. Upgrade to Pro for unlimited access.",
    'process.error': 'Error',
    'process.errorMsg': 'An error occurred during processing. Please try again.',

    // Result screen
    'result.noResult': 'No result available',
    'result.goBack': 'Go Back',
    'result.complete': 'Complete',
    'result.saveToCameraRoll': 'Save to Camera Roll',
    'result.share': 'Share',
    'result.goHome': 'Back to Home',
    'result.saveError': 'Error',
    'result.savePermission': 'Camera roll access is required',
    'result.saveSuccess': 'Saved',
    'result.saveSuccessMsg': 'Video saved to camera roll',

    // Paywall
    'paywall.subtitle': 'Unlock everything with a one-time purchase',
    'paywall.featureUnlimited': 'Unlimited video processing',
    'paywall.featureNoAds': 'No ads, ever',
    'paywall.purchaseLabel': 'One-time purchase, no recurring fees',
    'paywall.terms': 'Terms of Service',
    'paywall.privacy': 'Privacy Policy',
  },
} as const;

type TranslationKey = keyof typeof translations.ja;
type Locale = keyof typeof translations;

function getDeviceLocale(): Locale {
  try {
    const locales = getLocales();
    if (locales.length > 0 && locales[0].languageCode === 'ja') {
      return 'ja';
    }
  } catch {
    // fallback
  }
  return 'en';
}

let currentLocale: Locale | null = null;

function getLocale(): Locale {
  if (currentLocale === null) {
    currentLocale = getDeviceLocale();
  }
  return currentLocale;
}

/**
 * Translate a key, with optional interpolation.
 * Usage: t('home.dailyRemaining', { remaining: 3, limit: 5 })
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = getLocale();
  let text: string = translations[locale]?.[key] ?? translations.en[key] ?? key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }

  return text;
}

/**
 * React hook for translations. Returns t function and current locale.
 */
export function useTranslation() {
  const locale = useMemo(() => getLocale(), []);

  return { t, locale };
}
