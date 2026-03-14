import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import { useAppStore } from '@/stores/appStore';
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallModal } from '@/components/PaywallModal';
import { useState } from 'react';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isDark: boolean;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, isDark, danger }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, isDark && styles.rowDark]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? '#e74c3c' : '#6C5CE7'}
        style={styles.rowIcon}
      />
      <Text style={[styles.rowLabel, isDark && styles.textLight, danger && styles.textDanger]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, isDark && styles.textMuted]}>{value}</Text>
      )}
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={isDark ? '#555' : '#ccc'} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isPro } = useAppStore();
  const { restore } = useSubscription();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert('復元完了', '購入情報を復元しました');
    } catch {
      Alert.alert('エラー', '購入情報の復元に失敗しました');
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      {/* Pro section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>サブスクリプション</Text>
        {isPro ? (
          <View style={[styles.proBadge]}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.proBadgeText}>Pro プラン利用中</Text>
          </View>
        ) : (
          <SettingsRow
            icon="rocket"
            label="Pro にアップグレード"
            value="¥480/月〜"
            onPress={() => setPaywallVisible(true)}
            isDark={isDark}
          />
        )}
        <SettingsRow
          icon="refresh"
          label="購入を復元"
          onPress={handleRestore}
          isDark={isDark}
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>法的情報</Text>
        <SettingsRow
          icon="document-text"
          label="利用規約"
          onPress={() => Linking.openURL('https://example.com/terms')}
          isDark={isDark}
        />
        <SettingsRow
          icon="shield-checkmark"
          label="プライバシーポリシー"
          onPress={() => Linking.openURL('https://example.com/privacy')}
          isDark={isDark}
        />
        <SettingsRow
          icon="code-slash"
          label="オープンソースライセンス"
          onPress={() =>
            Alert.alert(
              'ライセンス',
              'Real-ESRGAN © Xintao Wang\nBSD 3-Clause License\n\n本アプリはReal-ESRGANを使用した超解像処理を行っています。',
            )
          }
          isDark={isDark}
        />
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>アプリ情報</Text>
        <SettingsRow icon="information-circle" label="バージョン" value="1.0.0" isDark={isDark} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDark && styles.textMuted]}>
          UpScale AI - AI動画超解像
        </Text>
        <Text style={[styles.footerCopy, isDark && styles.textMuted]}>
          Powered by Real-ESRGAN (BSD 3-Clause)
        </Text>
      </View>

      <PaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  containerDark: { backgroundColor: '#000' },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowDark: { backgroundColor: '#111', borderBottomColor: '#222' },
  rowIcon: { marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 16, color: '#1a1a2e' },
  rowValue: { fontSize: 14, color: '#999', marginRight: 8 },
  textLight: { color: '#fff' },
  textMuted: { color: '#888' },
  textDanger: { color: '#e74c3c' },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  proBadgeText: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
  footer: { alignItems: 'center', padding: 32 },
  footerText: { fontSize: 14, fontWeight: '600', color: '#999' },
  footerCopy: { fontSize: 11, color: '#bbb', marginTop: 4 },
});
