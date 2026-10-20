import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Thumbnail } from '@/components/Thumbnail';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/dialog';
import { colors } from '@/styles/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  // Tên món/loại món sắp xóa (kèm ảnh nếu có) để người dùng biết mình đang xóa gì
  subject: string;
  thumbnail?: string;
  // Đang xóa: khóa hai nút, nút Xóa hiện vòng quay
  busy: boolean;
  // Lỗi khi xóa hiện ngay trong hộp thoại
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Hộp thoại hỏi lại trước khi xóa: chỉ bấm "Xóa" mới xóa
export function ConfirmDialog({
  visible,
  title,
  message,
  subject,
  thumbnail,
  busy,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      // Nút Back của Android tương đương bấm "Hủy", trừ lúc đang xóa
      onRequestClose={() => {
        if (!busy) onCancel();
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icon name="trash" color={colors.danger} size={28} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.subject}>
            {thumbnail !== undefined && <Thumbnail uri={thumbnail} style={styles.subjectThumbnail} iconSize={16} />}
            <Text style={styles.subjectText} numberOfLines={2}>
              {subject}
            </Text>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
              onPress={onCancel}
              disabled={busy}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.button, styles.dangerButton, (pressed || busy) && styles.pressed]}
              onPress={onConfirm}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.confirmText}>{t('common.delete')}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
