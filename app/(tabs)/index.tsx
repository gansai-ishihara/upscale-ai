import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/stores/appStore';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { useTranslation } from '@/constants/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setSelectedVideoUri, history, isPro } = useAppStore();
  const { remaining, limit } = useDailyLimit();
  const { t } = useTranslation();

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert(t('home.permissionRequired'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedVideoUri(result.assets[0].uri);
      router.push('/process');
    }
  };

  const recentHistory = history.slice(0, 3);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Daily limit indicator */}
      {!isPro && (
        <View style={[styles.limitBadge, remaining === 0 && styles.limitBadgeEmpty]}>
          <Ionicons name="flash" size={14} color={remaining === 0 ? '#e74c3c' : '#6C5CE7'} />
          <Text style={[styles.limitText, remaining === 0 && styles.limitTextEmpty]}>
            {t('home.dailyRemaining', { remaining, limit })}
          </Text>
        </View>
      )}

      {/* Video picker area */}
      <TouchableOpacity
        style={[styles.pickArea, isDark && styles.pickAreaDark]}
        onPress={pickVideo}
        activeOpacity={0.7}
      >
        <Ionicons name="cloud-upload-outline" size={64} color="#6C5CE7" />
        <Text style={[styles.pickTitle, isDark && styles.textLight]}>
          {t('home.pickVideo')}
        </Text>
        <Text style={[styles.pickSubtitle, isDark && styles.textMuted]}>
          {t('home.pickSubtitle')}
        </Text>
        <Text style={[styles.pickFormats, isDark && styles.textMuted]}>
          {t('home.pickFormats')}
        </Text>
      </TouchableOpacity>

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>
            {t('home.recentHistory')}
          </Text>
          <FlatList
            horizontal
            data={recentHistory}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.historyCard, isDark && styles.historyCardDark]}>
                <Image
                  source={{ uri: item.thumbnailUri }}
                  style={styles.historyThumb}
                />
                <Text style={[styles.historyLabel, isDark && styles.textMuted]} numberOfLines={1}>
                  {item.outputResolution} · x{item.scale}
                </Text>
              </View>
            )}
          />
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#000',
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f0ecff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 4,
  },
  limitBadgeEmpty: {
    backgroundColor: '#fde8e8',
  },
  limitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  limitTextEmpty: {
    color: '#e74c3c',
  },
  pickArea: {
    flex: 1,
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0d8ff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pickAreaDark: {
    backgroundColor: '#111',
    borderColor: '#333',
  },
  pickTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 8,
  },
  pickSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  pickFormats: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  textLight: {
    color: '#fff',
  },
  textMuted: {
    color: '#888',
  },
  recentSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  historyCard: {
    width: 100,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  historyCardDark: {
    backgroundColor: '#111',
  },
  historyThumb: {
    width: 100,
    height: 75,
    backgroundColor: '#eee',
  },
  historyLabel: {
    fontSize: 11,
    color: '#666',
    padding: 6,
    textAlign: 'center',
  },
});
