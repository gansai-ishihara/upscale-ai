import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';

interface ProgressBarProps {
  current: number;
  total: number;
  estimatedTimeRemaining: number;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `約${Math.ceil(seconds)}秒`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `約${m}分${s}秒`;
}

export function ProgressBar({ current, total, estimatedTimeRemaining }: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const progress = total > 0 ? current / total : 0;
  const percent = Math.round(progress * 100);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.label, isDark && styles.textLight]}>
          フレーム {current}/{total} 処理中...
        </Text>
        <Text style={[styles.percent, isDark && styles.textLight]}>{percent}%</Text>
      </View>

      <View style={[styles.track, isDark && styles.trackDark]}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      {estimatedTimeRemaining > 0 && (
        <Text style={[styles.eta, isDark && styles.textMuted]}>
          残り {formatTime(estimatedTimeRemaining)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  containerDark: { backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  percent: { fontSize: 14, fontWeight: '700', color: '#6C5CE7' },
  track: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackDark: { backgroundColor: '#222' },
  fill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
  eta: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' },
  textLight: { color: '#fff' },
  textMuted: { color: '#888' },
});
