import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/field';
import { colors } from '@/styles/theme';
import type { DishCategory } from '@/types';

type CategorySelectProps = {
  // Loại món đọc từ SQLite
  categories: DishCategory[];
  // Id loại đang chọn; rỗng = chưa chọn
  value: string;
  onChange: (categoryId: string) => void;
  invalid?: boolean;
};

// Ô chọn loại món kiểu dropdown: bấm vào mở danh sách loại món, chọn một dòng thì đóng lại
export function CategorySelect({ categories, value, onChange, invalid = false }: CategorySelectProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = categories.find((category) => category.id === value);

  const choose = (categoryId: string) => {
    onChange(categoryId);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.input, styles.select, invalid && styles.inputError, pressed && styles.pressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('form.chooseCategory')}
      >
        <Text style={selected ? styles.selectText : styles.selectPlaceholder} numberOfLines={1}>
          {selected ? selected.name : t('form.chooseCategory')}
        </Text>
        <Icon name="chevronDown" color={colors.muted} />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={styles.backdropTouch}
            onPress={() => setOpen(false)}
            accessibilityLabel={t('common.cancel')}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('form.chooseCategory')}</Text>
            <ScrollView>
              {categories.map((category) => {
                const isSelected = category.id === value;
                return (
                  <Pressable
                    key={category.id}
                    style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
                    onPress={() => choose(category.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.optionText}>
                      <Text style={styles.optionName}>{category.name}</Text>
                      {!!category.description && (
                        <Text style={styles.optionDescription} numberOfLines={1}>
                          {category.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Icon name="check" color={colors.primary} />}
                  </Pressable>
                );
              })}
              {categories.length === 0 && <Text style={styles.optionsEmpty}>{t('form.noCategories')}</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
