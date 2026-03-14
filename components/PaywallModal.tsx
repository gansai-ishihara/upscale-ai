import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'infinite' as const, text: '無制限の動画処理' },
  { icon: 'eye-off' as const, text: '広告を完全非表示' },
  { icon: 'water' as const, text: '透かしなしの出力' },
  { icon: 'flash' as const, text: '優先処理キュー' },
];

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { purchaseMonthly, purchaseYearly } = useSubscription();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#999" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={40} color="#FFD700" />
          </View>
          <Text style={styles.title}>UpScale AI Pro</Text>
          <Text style={styles.subtitle}>全機能をアンロック</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={f.icon} size={22} color="#6C5CE7" />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plans}>
          <TouchableOpacity style={styles.planCard} onPress={purchaseYearly}>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>約34%お得</Text>
            </View>
            <Text style={styles.planPrice}>¥3,800</Text>
            <Text style={styles.planPeriod}>年額 (¥317/月)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.planCard, styles.planCardSecondary]} onPress={purchaseMonthly}>
            <Text style={styles.planPrice}>¥480</Text>
            <Text style={styles.planPeriod}>月額</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          いつでもキャンセル可能 · 自動更新サブスクリプション
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  header: { alignItems: 'center', marginTop: 20 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a2e', marginTop: 16 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  features: { marginTop: 32, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, color: '#333', fontWeight: '500' },
  plans: { flexDirection: 'row', gap: 12, marginTop: 32 },
  planCard: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  planCardSecondary: { backgroundColor: '#f0ecff' },
  planPrice: { fontSize: 28, fontWeight: '800', color: '#fff' },
  planPeriod: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bestValueText: { fontSize: 11, fontWeight: '700', color: '#1a1a2e' },
  legal: { textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 20 },
});
