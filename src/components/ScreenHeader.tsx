import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/header';
import { colors } from '@/styles/theme';
import { goBack } from '@/utils/navigation';

// Thanh tiêu đề của các màn hình con: nút quay lại, tiêu đề, nút đổi ngôn ngữ
export function ScreenHeader({ title }: { title: string }) {
  const { t } = useLanguage();
  return (
    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        onPress={goBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <Icon name="back" color={colors.ink} size={24} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <LanguageToggle />
    </View>
  );
}
