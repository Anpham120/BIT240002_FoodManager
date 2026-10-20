import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/stateView';
import { colors } from '@/styles/theme';

// Các trạng thái dùng chung: đang tải, lỗi, danh sách rỗng / không tìm thấy

export function LoadingState() {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.hint, styles.loadingHint]}>{t('common.loading')}</Text>
    </View>
  );
}

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <View style={[styles.icon, styles.errorIcon]}>
        <Icon name="alert" color={colors.danger} size={36} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{message}</Text>
      <Pressable
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        onPress={onRetry}
        accessibilityRole="button"
      >
        <Icon name="refresh" color={colors.primary} size={18} />
        <Text style={styles.actionText}>{t('common.retry')}</Text>
      </Pressable>
    </View>
  );
}

type EmptyStateProps = {
  icon: IconName;
  title: string;
  hint: string;
  // Nút bên dưới (vd: "Về danh sách" khi không tìm thấy món theo Id)
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Icon name={icon} color={colors.primary} size={36} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          onPress={onAction}
          accessibilityRole="button"
        >
          <Icon name="back" color={colors.primary} size={18} />
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
