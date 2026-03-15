import { StyleSheet, View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '@/hooks/useSubscription';
import { LEGAL_URLS } from '@/constants/config';
import { useTranslation } from '@/constants/i18n';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { purchase } = useSubscription();
  const { t, locale } = useTranslation();
  const termsUrl = locale === 'ja' ? LEGAL_URLS.TERMS_JA : LEGAL_URLS.TERMS_EN;
  const privacyUrl = locale === 'ja' ? LEGAL_URLS.PRIVACY_JA : LEGAL_URLS.PRIVACY_EN;

  const FEATURES = [
    { icon: 'infinite' as const, text: t('paywall.featureUnlimited') },
    { icon: 'ban' as const, text: t('paywall.featureNoAds') },
  ];

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
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
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

        {/* Purchase button */}
        <TouchableOpacity style={styles.purchaseBtn} onPress={purchase}>
          <Text style={styles.purchaseLabel}>{t('paywall.purchaseLabel')}</Text>
        </TouchableOpacity>

        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => Linking.openURL(termsUrl)}>
            <Text style={styles.legalLink}>{t('paywall.terms')}</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL(privacyUrl)}>
            <Text style={styles.legalLink}>{t('paywall.privacy')}</Text>
          </TouchableOpacity>
        </View>
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
  purchaseBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  purchaseLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  legalLink: { fontSize: 12, color: '#6C5CE7', textDecorationLine: 'underline' },
  legalSeparator: { fontSize: 12, color: '#ccc' },
});
