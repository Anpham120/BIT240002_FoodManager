import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/AlertDialog';
import { Field } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/StateView';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { common } from '@/styles/common';
import { styles } from '@/styles/form';
import { goBack } from '@/utils/navigation';
import {
  errorKeys,
  hasErrors,
  toCategoryInput,
  validateCategoryForm,
  type CategoryFormValues,
} from '@/utils/validation';

type AlertContent = { title: TranslationKey; messages: TranslationKey[] };

// Màn hình thêm loại món (không có tham số id) hoặc sửa loại món (id của loại cần sửa)
export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useLanguage();
  const { categories, saveCategory } = useData();
  const editing = id ? categories.find((category) => category.id === id) : undefined;
  const [values, setValues] = useState<CategoryFormValues>(() => ({
    name: editing?.name ?? '',
    description: editing?.description ?? '',
  }));
  // Chưa bấm Lưu thì chưa báo lỗi; bấm rồi thì lỗi cập nhật ngay khi gõ
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertContent>({ title: 'form.invalidTitle', messages: [] });
  const [alertVisible, setAlertVisible] = useState(false);

  // Sửa loại món có Id không tồn tại
  if (id && !editing) {
    return (
      <SafeAreaView style={common.safeArea}>
        <ScreenHeader title={t('categoryForm.editTitle')} />
        <EmptyState
          icon="alert"
          title={t('categoryForm.notFoundTitle')}
          hint={t('categoryForm.notFoundHint')}
          actionLabel={t('common.back')}
          onAction={goBack}
        />
      </SafeAreaView>
    );
  }

  const update = (field: keyof CategoryFormValues) => (text: string) =>
    setValues((current) => ({ ...current, [field]: text }));

  const errors = submitted ? validateCategoryForm(values, categories, id) : {};

  const showAlert = (title: TranslationKey, messages: TranslationKey[]) => {
    setAlert({ title, messages });
    setAlertVisible(true);
  };

  const handleSave = async () => {
    setSubmitted(true);
    Keyboard.dismiss();
    const result = validateCategoryForm(values, categories, id);
    if (hasErrors(result)) {
      showAlert('form.invalidTitle', errorKeys(result));
      return;
    }

    setSaving(true);
    try {
      const saved = await saveCategory(id, toCategoryInput(values));
      if (!saved) {
        setSaving(false);
        showAlert('form.saveFailedTitle', ['errors.categoryNotFound']);
        return;
      }
      goBack();
    } catch {
      setSaving(false);
      showAlert('form.saveFailedTitle', ['errors.saveFailed']);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <KeyboardAvoidingView style={common.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={t(id ? 'categoryForm.editTitle' : 'categoryForm.addTitle')} />

        <ScrollView style={common.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field
            label={t('categoryForm.name')}
            placeholder={t('categoryForm.namePlaceholder')}
            value={values.name}
            onChangeText={update('name')}
            error={errors.name && t(errors.name)}
          />
          <Field
            label={t('categoryForm.description')}
            placeholder={t('categoryForm.descriptionPlaceholder')}
            value={values.description}
            onChangeText={update('description')}
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />
        </ScrollView>

        <View style={common.footer}>
          <PrimaryButton
            label={t(id ? 'categoryForm.saveEdit' : 'categoryForm.saveAdd')}
            onPress={handleSave}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>

      <AlertDialog
        visible={alertVisible}
        title={t(alert.title)}
        messages={alert.messages.map((key) => t(key))}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
