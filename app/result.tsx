import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/stores/appStore';
import { BeforeAfter } from '@/components/BeforeAfter';
import { useTranslation } from '@/constants/i18n';

export default function ResultScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { selectedVideoUri, outputVideoUri, isPro } = useAppStore();
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!outputVideoUri) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('result.saveError'), t('result.savePermission'));
      return;
    }
    const asset = await MediaLibrary.createAssetAsync(outputVideoUri);
    const album = await MediaLibrary.getAlbumAsync('UpScale AI');
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync('UpScale AI', asset, false);
    }
    Alert.alert(t('result.saveSuccess'), t('result.saveSuccessMsg'));
  };

  const handleShare = async () => {
    if (!outputVideoUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(outputVideoUri);
    }
  };

  if (!outputVideoUri) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.center]}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={[styles.emptyText, isDark && styles.textMuted]}>
          {t('result.noResult')}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t('result.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Before/After comparison */}
      <View style={styles.comparisonArea}>
        <BeforeAfter
          beforeUri={selectedVideoUri ?? ''}
          afterUri={outputVideoUri}
        />
      </View>

      {/* Result info */}
      <View style={[styles.infoCard, isDark && styles.cardDark]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDark && styles.textMuted]}>{t('result.complete')}</Text>
          <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="download-outline" size={22} color="#fff" />
          <Text style={styles.saveBtnText}>{t('result.saveToCameraRoll')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.shareBtn, isDark && styles.shareBtnDark]} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#6C5CE7" />
          <Text style={styles.shareBtnText}>{t('result.share')}</Text>
        </TouchableOpacity>
      </View>

      {/* Return to home */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={[styles.homeBtnText, isDark && styles.textMuted]}>{t('result.goHome')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  comparisonArea: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  watermarkBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  watermarkText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  cardDark: { backgroundColor: '#111' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0ecff',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  shareBtnDark: { backgroundColor: '#1a1a2e' },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: '#6C5CE7' },
  homeBtn: { alignItems: 'center', padding: 20 },
  homeBtnText: { fontSize: 14, color: '#999' },
  backBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#999' },
  textMuted: { color: '#888' },
});
