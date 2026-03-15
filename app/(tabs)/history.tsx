import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore, HistoryItem } from '@/stores/appStore';
import { useTranslation } from '@/constants/i18n';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { history, clearHistory } = useAppStore();
  const { t } = useTranslation();

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0
      ? `${m}${t('history.minuteShort')}${s}${t('history.secondShort')}`
      : `${s}${t('history.secondShort')}`;
  };

  const handleClear = () => {
    Alert.alert(t('history.clearTitle'), t('history.clearMessage'), [
      { text: t('history.cancel'), style: 'cancel' },
      { text: t('history.delete'), style: 'destructive', onPress: clearHistory },
    ]);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, isDark && styles.textLight]}>
          {item.inputResolution} → {item.outputResolution}
        </Text>
        <Text style={[styles.cardMeta, isDark && styles.textMuted]}>
          {formatDuration(item.processingTime)} · {formatFileSize(item.fileSize)}
        </Text>
        <Text style={[styles.cardDate, isDark && styles.textMuted]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDark ? '#555' : '#ccc'} />
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={64} color={isDark ? '#333' : '#ddd'} />
          <Text style={[styles.emptyText, isDark && styles.textMuted]}>
            {t('history.empty')}
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.textMuted]}>
            {t('history.emptySubtext')}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, isDark && styles.textLight]}>
              {t('history.count', { count: history.length })}
            </Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearButton}>{t('history.clearAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 14, fontWeight: '600', color: '#666' },
  clearButton: { fontSize: 14, color: '#e74c3c' },
  list: { padding: 16, paddingTop: 0 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    gap: 12,
  },
  cardDark: { backgroundColor: '#111' },
  thumbnail: {
    width: 60,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  cardDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  textLight: { color: '#fff' },
  textMuted: { color: '#888' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#bbb', textAlign: 'center', lineHeight: 20 },
});
