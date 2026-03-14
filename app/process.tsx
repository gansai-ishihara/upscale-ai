import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/stores/appStore';
import { useUpscaler } from '@/hooks/useUpscaler';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { ProgressBar } from '@/components/ProgressBar';
import { AdBanner } from '@/components/AdBanner';

export default function ProcessScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { selectedVideoUri, options, setOptions, processing, isPro } = useAppStore();
  const { startUpscale, cancelUpscale } = useUpscaler();
  const { remaining, canProcess, incrementCount } = useDailyLimit();

  const handleStart = async () => {
    if (!selectedVideoUri) return;

    if (!isPro && !canProcess) {
      Alert.alert('制限に達しました', '今日の無料枠を使い切りました。Proプランにアップグレードすると無制限に利用できます。');
      return;
    }

    try {
      await startUpscale(selectedVideoUri, options);
      if (!isPro) await incrementCount();
      router.replace('/result');
    } catch (error) {
      Alert.alert('エラー', '処理中にエラーが発生しました。もう一度お試しください。');
    }
  };

  if (!selectedVideoUri) {
    router.back();
    return null;
  }

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Video info */}
      <View style={[styles.videoPreview, isDark && styles.cardDark]}>
        <Ionicons name="videocam" size={40} color="#6C5CE7" />
        <Text style={[styles.videoLabel, isDark && styles.textLight]}>
          動画を選択済み
        </Text>
      </View>

      {/* Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>設定</Text>

        {/* Scale selector */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.optionLabel, isDark && styles.textLight]}>
            アップスケール倍率
          </Text>
          <View style={styles.scaleButtons}>
            <TouchableOpacity
              style={[styles.scaleBtn, options.scale === 2 && styles.scaleBtnActive]}
              onPress={() => setOptions({ scale: 2 })}
            >
              <Text style={[styles.scaleBtnText, options.scale === 2 && styles.scaleBtnTextActive]}>
                x2
              </Text>
              <Text style={[styles.scaleDesc, options.scale === 2 && styles.scaleBtnTextActive]}>
                720p → 1080p
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scaleBtn, options.scale === 4 && styles.scaleBtnActive]}
              onPress={() => setOptions({ scale: 4 })}
            >
              <Text style={[styles.scaleBtnText, options.scale === 4 && styles.scaleBtnTextActive]}>
                x4
              </Text>
              <Text style={[styles.scaleDesc, options.scale === 4 && styles.scaleBtnTextActive]}>
                480p → 1080p
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle options */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.optionLabel, isDark && styles.textLight]}>ノイズ除去</Text>
              <Text style={[styles.optionDesc, isDark && styles.textMuted]}>AI生成ノイズを軽減</Text>
            </View>
            <Switch
              value={options.denoise}
              onValueChange={(v) => setOptions({ denoise: v })}
              trackColor={{ true: '#6C5CE7' }}
            />
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.optionLabel, isDark && styles.textLight]}>シャープネス強化</Text>
              <Text style={[styles.optionDesc, isDark && styles.textMuted]}>輪郭をくっきり補正</Text>
            </View>
            <Switch
              value={options.sharpen}
              onValueChange={(v) => setOptions({ sharpen: v })}
              trackColor={{ true: '#6C5CE7' }}
            />
          </View>
        </View>

        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.optionLabel, isDark && styles.textLight]}>色補正 (SNS最適化)</Text>
              <Text style={[styles.optionDesc, isDark && styles.textMuted]}>SNS投稿に最適な色味に調整</Text>
            </View>
            <Switch
              value={options.colorEnhance}
              onValueChange={(v) => setOptions({ colorEnhance: v })}
              trackColor={{ true: '#6C5CE7' }}
            />
          </View>
        </View>
      </View>

      {/* Processing progress */}
      {processing.isProcessing && (
        <View style={styles.section}>
          <ProgressBar
            current={processing.currentFrame}
            total={processing.totalFrames}
            estimatedTimeRemaining={processing.estimatedTimeRemaining}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelUpscale}>
            <Text style={styles.cancelBtnText}>処理を中止</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Start button */}
      {!processing.isProcessing && (
        <TouchableOpacity
          style={[styles.startBtn, (!canProcess && !isPro) && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!canProcess && !isPro}
        >
          <Ionicons name="sparkles" size={22} color="#fff" />
          <Text style={styles.startBtnText}>処理開始</Text>
        </TouchableOpacity>
      )}

      {/* Daily limit warning */}
      {!isPro && (
        <Text style={[styles.limitNote, isDark && styles.textMuted]}>
          残り {remaining} 回 (Proで無制限)
        </Text>
      )}

      {/* Interstitial ad placeholder */}
      {!isPro && <AdBanner />}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#000' },
  videoPreview: {
    height: 120,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  section: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  cardDark: { backgroundColor: '#111' },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  optionDesc: { fontSize: 12, color: '#999' },
  scaleButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  scaleBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0d8ff',
    alignItems: 'center',
  },
  scaleBtnActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  scaleBtnText: { fontSize: 24, fontWeight: '800', color: '#6C5CE7' },
  scaleBtnTextActive: { color: '#fff' },
  scaleDesc: { fontSize: 11, color: '#999', marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#6C5CE7',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startBtnDisabled: { backgroundColor: '#ccc' },
  startBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
  },
  cancelBtnText: { fontSize: 14, color: '#e74c3c', fontWeight: '600' },
  limitNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  textLight: { color: '#fff' },
  textMuted: { color: '#888' },
});
