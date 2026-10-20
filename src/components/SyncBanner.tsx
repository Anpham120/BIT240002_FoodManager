import { ActivityIndicator, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { styles } from '@/styles/syncBanner';
import { colors } from '@/styles/theme';

type Tone = 'muted' | 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, { color: string; background: string }> = {
  muted: { color: colors.muted, background: colors.chip },
  info: { color: colors.info, background: colors.infoSoft },
  success: { color: colors.success, background: colors.successSoft },
  warning: { color: colors.warning, background: colors.warningSoft },
  danger: { color: colors.danger, background: colors.dangerSoft },
};

// Thanh trạng thái đồng bộ: mất mạng (thay đổi lưu trên máy) / đang đồng bộ / lỗi / còn thay đổi chờ gửi / đã đồng bộ
export function SyncBanner() {
  const { t } = useLanguage();
  const { online, syncing, error } = useSync();
  const { pendingCount } = useData();

  let tone: Tone = 'success';
  let icon: IconName | null = 'check';
  let text = t('sync.synced');
  if (online === null) {
    tone = 'muted';
    icon = 'cloud';
    text = t('sync.checking');
  } else if (!online) {
    tone = 'warning';
    icon = 'cloudOff';
    text = pendingCount > 0 ? t('sync.offlinePending', { count: pendingCount }) : t('sync.offline');
  } else if (syncing) {
    tone = 'info';
    icon = null;
    text = t('sync.syncing');
  } else if (error) {
    tone = 'danger';
    icon = 'alert';
    text = t('sync.failed', { reason: t(error.key, error.params) });
  } else if (pendingCount > 0) {
    tone = 'warning';
    icon = 'refresh';
    text = t('sync.pending', { count: pendingCount });
  }

  const { color, background } = TONES[tone];
  return (
    <View style={[styles.banner, { backgroundColor: background }]} accessibilityRole="summary" accessibilityLiveRegion="polite">
      {icon ? <Icon name={icon} color={color} size={16} /> : <ActivityIndicator size="small" color={color} />}
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}
