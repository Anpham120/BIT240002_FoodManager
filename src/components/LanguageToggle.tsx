import { Pressable, Text, View } from 'react-native';

import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/i18n';
import { common } from '@/styles/common';
import { styles } from '@/styles/languageToggle';

const OPTIONS: { value: Language; label: string; name: string }[] = [
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'vi', label: 'VI', name: 'Tiếng Việt' },
];

// Nút chuyển English ↔ Tiếng Việt (có ở đầu mọi màn hình)
export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup" accessibilityLabel={t('language.switch')}>
      {OPTIONS.map((option) => {
        const selected = option.value === language;
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && common.pressed]}
            onPress={() => setLanguage(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.name}
            accessibilityState={{ selected }}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
