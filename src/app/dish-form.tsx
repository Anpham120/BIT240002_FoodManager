import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/AlertDialog';
import { CategorySelect } from '@/components/CategorySelect';
import { Field, FieldGroup } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/StateView';
import { Thumbnail } from '@/components/Thumbnail';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { common } from '@/styles/common';
import { styles as fieldStyles } from '@/styles/field';
import { styles } from '@/styles/form';
import { colors } from '@/styles/theme';
import type { Dish } from '@/types';
import { addImage, removeImage, setThumbnail } from '@/utils/dishImages';
import { goBack } from '@/utils/navigation';
import {
  errorKeys,
  hasErrors,
  toDishInput,
  validateDishForm,
  validateImageUrl,
  type DishFormValues,
} from '@/utils/validation';

const EMPTY_FORM: DishFormValues = {
  name: '',
  dishCategoryId: '',
  price: '',
  preparationTime: '',
  isAvailable: true,
  description: '',
  images: [],
};

function toFormValues(dish: Dish): DishFormValues {
  return {
    name: dish.name,
    dishCategoryId: dish.dishCategoryId,
    price: String(dish.price),
    preparationTime: String(dish.preparationTime),
    isAvailable: dish.isAvailable,
    description: dish.description,
    images: dish.images,
  };
}

// Nội dung hộp thoại báo lỗi, lưu dạng khóa dịch để đổi ngôn ngữ là đổi theo
type AlertContent = { title: TranslationKey; messages: TranslationKey[] };

// Màn hình thêm món (không có tham số id) hoặc sửa món (id của món cần sửa)
export default function DishFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useLanguage();
  const { dishes, categories, saveDish } = useData();
  const editing = id ? dishes.find((dish) => dish.id === id) : undefined;
  // Sửa thì điền sẵn dữ liệu của món, thêm mới thì form trống
  const [values, setValues] = useState<DishFormValues>(() => (editing ? toFormValues(editing) : EMPTY_FORM));
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<TranslationKey>();
  // Chưa bấm Lưu thì chưa báo lỗi; bấm rồi thì lỗi cập nhật ngay khi gõ
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // Giữ nội dung hộp thoại sau khi đóng để lúc mờ dần không bị trống
  const [alert, setAlert] = useState<AlertContent>({ title: 'form.invalidTitle', messages: [] });
  const [alertVisible, setAlertVisible] = useState(false);

  // Sửa món có Id không tồn tại
  if (id && !editing) {
    return (
      <SafeAreaView style={common.safeArea}>
        <ScreenHeader title={t('form.editTitle')} />
        <EmptyState
          icon="alert"
          title={t('detail.notFoundTitle')}
          hint={t('detail.notFoundHint')}
          actionLabel={t('common.backToList')}
          onAction={goBack}
        />
      </SafeAreaView>
    );
  }

  // Hàm cập nhật một ô chữ của form
  const update = (field: 'name' | 'dishCategoryId' | 'price' | 'preparationTime' | 'description') => (text: string) =>
    setValues((current) => ({ ...current, [field]: text }));

  const errors = submitted ? validateDishForm(values, categories, dishes, id) : {};

  // Thêm ảnh bằng ImageUrl: kiểm tra link rồi thêm vào cuối danh sách (ảnh đầu tiên tự làm ảnh đại diện)
  const handleAddImage = () => {
    const error = validateImageUrl(imageUrl, values.images);
    setImageError(error);
    if (error) return;
    setValues((current) => ({ ...current, images: addImage(current.images, imageUrl.trim()) }));
    setImageUrl('');
  };

  const showAlert = (title: TranslationKey, messages: TranslationKey[]) => {
    setAlert({ title, messages });
    setAlertVisible(true);
  };

  const handleSave = async () => {
    setSubmitted(true);
    Keyboard.dismiss();
    const result = validateDishForm(values, categories, dishes, id);
    if (hasErrors(result)) {
      // Báo lỗi bằng hộp thoại, mỗi lỗi một dòng (dưới từng ô vẫn hiện lỗi để biết ô nào sai)
      showAlert('form.invalidTitle', errorKeys(result));
      return;
    }

    setSaving(true);
    try {
      const saved = await saveDish(id, toDishInput(values));
      if (!saved) {
        setSaving(false);
        showAlert('form.saveFailedTitle', ['errors.dishNotFound']);
        return;
      }
      // Quay về màn hình trước; dữ liệu đã được đọc lại từ SQLite nên hiển thị ngay
      goBack();
    } catch {
      setSaving(false);
      showAlert('form.saveFailedTitle', ['errors.saveFailed']);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <KeyboardAvoidingView style={common.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScreenHeader title={t(id ? 'form.editTitle' : 'form.addTitle')} />

        <ScrollView style={common.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            value={values.name}
            onChangeText={update('name')}
            error={errors.name && t(errors.name)}
          />
          <FieldGroup label={t('form.category')} error={errors.dishCategoryId && t(errors.dishCategoryId)}>
            <CategorySelect
              categories={categories}
              value={values.dishCategoryId}
              onChange={update('dishCategoryId')}
              invalid={!!errors.dishCategoryId}
            />
          </FieldGroup>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Field
                label={t('form.price')}
                placeholder={t('form.pricePlaceholder')}
                value={values.price}
                onChangeText={update('price')}
                keyboardType="numeric"
                error={errors.price && t(errors.price)}
              />
            </View>
            <View style={styles.rowItem}>
              <Field
                label={t('form.preparationTime')}
                placeholder={t('form.preparationTimePlaceholder')}
                value={values.preparationTime}
                onChangeText={update('preparationTime')}
                keyboardType="numeric"
                error={errors.preparationTime && t(errors.preparationTime)}
              />
            </View>
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('form.available')}</Text>
            <Switch
              value={values.isAvailable}
              onValueChange={(isAvailable) => setValues((current) => ({ ...current, isAvailable }))}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
              accessibilityLabel={t('form.available')}
            />
          </View>
          <Field
            label={t('form.description')}
            placeholder={t('form.descriptionPlaceholder')}
            value={values.description}
            onChangeText={update('description')}
            multiline
            textAlignVertical="top"
            style={styles.textArea}
          />

          {/* Danh sách ảnh: bấm ngôi sao để chọn ảnh đại diện (chỉ 1 ảnh), bấm thùng rác để xóa ảnh */}
          <View style={styles.images}>
            <Text style={fieldStyles.label}>{t('form.images')}</Text>
            {values.images.length === 0 && <Text style={styles.imagesEmpty}>{t('form.imagesEmpty')}</Text>}
            {values.images.map((image) => (
              <View key={image.imageUrl} style={[styles.imageRow, image.isThumbnail && styles.imageRowThumbnail]}>
                <Thumbnail uri={image.imageUrl} style={styles.imageThumb} iconSize={18} />
                <View style={styles.imageText}>
                  <Text style={styles.imageUrl} numberOfLines={2}>
                    {image.imageUrl}
                  </Text>
                  {image.isThumbnail && <Text style={styles.thumbnailLabel}>{t('form.thumbnail')}</Text>}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.iconButton, pressed && common.pressed]}
                  onPress={() => setValues((current) => ({ ...current, images: setThumbnail(current.images, image.imageUrl) }))}
                  accessibilityRole="button"
                  accessibilityLabel={t('form.setThumbnail')}
                  accessibilityState={{ selected: image.isThumbnail }}
                >
                  <Icon name="star" color={colors.primary} fill={image.isThumbnail ? colors.primary : 'none'} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.iconButton, pressed && common.pressed]}
                  onPress={() => setValues((current) => ({ ...current, images: removeImage(current.images, image.imageUrl) }))}
                  accessibilityRole="button"
                  accessibilityLabel={t('form.removeImage')}
                >
                  <Icon name="trash" color={colors.danger} />
                </Pressable>
              </View>
            ))}
            {values.images.length > 1 && <Text style={styles.imageHint}>{t('form.imageHint')}</Text>}
          </View>

          <FieldGroup label={t('form.imageUrl')} error={imageError && t(imageError)}>
            <View style={styles.addImageRow}>
              <TextInput
                style={[fieldStyles.input, styles.addImageInput, !!imageError && fieldStyles.inputError]}
                placeholder={t('form.imageUrlPlaceholder')}
                placeholderTextColor={colors.placeholder}
                accessibilityLabel={t('form.imageUrl')}
                value={imageUrl}
                onChangeText={(text) => {
                  setImageUrl(text);
                  setImageError(undefined);
                }}
                onSubmitEditing={handleAddImage}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
              <Pressable
                style={({ pressed }) => [styles.addImageButton, pressed && common.pressed]}
                onPress={handleAddImage}
                accessibilityRole="button"
              >
                <Icon name="plus" color={colors.primary} size={18} />
                <Text style={styles.addImageText}>{t('form.addImage')}</Text>
              </Pressable>
            </View>
          </FieldGroup>
        </ScrollView>

        <View style={common.footer}>
          <PrimaryButton label={t(id ? 'form.saveEdit' : 'form.saveAdd')} onPress={handleSave} loading={saving} />
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
