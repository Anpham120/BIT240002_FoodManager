import { ActivityIndicator, Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { common } from '@/styles/common';
import { colors } from '@/styles/theme';

type PrimaryButtonProps = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  // Đang xử lý (vd: đang lưu): hiện vòng quay và không cho bấm tiếp
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Nút chính (màu chủ đạo), rộng hết chiều ngang
export function PrimaryButton({ label, icon, onPress, loading = false, style }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [common.primaryButton, style, pressed && common.pressed, loading && common.disabled]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <>
          {icon && <Icon name={icon} color={colors.surface} />}
          <Text style={common.primaryButtonText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
