import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/StateView';
import { Thumbnail } from '@/components/Thumbnail';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { common } from '@/styles/common';
import { styles } from '@/styles/dishDetail';
import { colors } from '@/styles/theme';
import type { Dish } from '@/types';
import { getThumbnailUrl } from '@/utils/dishImages';
import { formatPrice, isQuickDish } from '@/utils/format';
import { goBack } from '@/utils/navigation';

type InfoRowProps = {
  icon: IconName;
  label: string;
  value: string;
  // Kẻ đường phân cách phía trên (mọi dòng trừ dòng đầu)
  bordered?: boolean;
};

function InfoRow({ icon, label, value, bordered = false }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, bordered && styles.infoRowBorder]}>
      <View style={styles.infoIcon}>
        <Icon name={icon} color={colors.primary} size={18} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// Màn hình chi tiết món: xem nhiều ảnh (khung lớn + dải ảnh nhỏ), thông tin, Nhanh/Thông thường; sửa, xóa
export default function DishDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { dishes, categories, deleteDish } = useData();
  // Ảnh đang xem ở khung lớn; chưa chọn thì là ảnh đại diện
  const [selectedUrl, setSelectedUrl] = useState<string>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  // Món vừa xóa: giữ nội dung trong lúc quay về danh sách để màn hình không chớp sang "không tìm thấy"
  const [removed, setRemoved] = useState<Dish>();

  const dish = dishes.find((item) => item.id === id) ?? removed;

  // Id không tồn tại (link sai, hoặc món vừa bị xóa ở nơi khác)
  if (!dish) {
    return (
      <SafeAreaView style={common.safeArea}>
        <ScreenHeader title={t('detail.title')} />
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

  const categoryName = categories.find((category) => category.id === dish.dishCategoryId)?.name;
  const thumbnailUrl = getThumbnailUrl(dish.images);
  const shownUrl = dish.images.some((image) => image.imageUrl === selectedUrl) ? selectedUrl : thumbnailUrl;
  const shownIsThumbnail = dish.images.some((image) => image.imageUrl === shownUrl && image.isThumbnail);
  const quick = isQuickDish(dish.preparationTime);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(undefined);
    setRemoved(dish);
    try {
      await deleteDish(dish.id);
      setConfirmVisible(false);
      goBack();
    } catch {
      setRemoved(undefined);
      setDeleting(false);
      setDeleteError(t('detail.deleteFailed'));
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <ScreenHeader title={t('detail.title')} />
      <ScrollView style={common.flex} contentContainerStyle={styles.content}>
        <View>
          <Thumbnail uri={shownUrl} style={styles.cover} iconSize={40} showStatus />
          {shownIsThumbnail && (
            <View style={styles.coverBadge}>
              <Icon name="star" color={colors.surface} fill={colors.surface} size={14} />
              <Text style={styles.coverBadgeText}>{t('detail.thumbnail')}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionLabel}>{t('detail.images', { count: dish.images.length })}</Text>
        {dish.images.length === 0 ? (
          <Text style={styles.noImages}>{t('detail.noImages')}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {dish.images.map((image, index) => {
              const selected = image.imageUrl === shownUrl;
              return (
                <Pressable
                  key={image.imageUrl}
                  style={({ pressed }) => [styles.galleryItem, selected && styles.galleryItemSelected, pressed && common.pressed]}
                  onPress={() => setSelectedUrl(image.imageUrl)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`${index + 1}/${dish.images.length}${image.isThumbnail ? ` · ${t('detail.thumbnail')}` : ''}`}
                  accessibilityState={{ selected }}
                >
                  <Thumbnail uri={image.imageUrl} style={styles.galleryImage} iconSize={18} />
                  {image.isThumbnail && (
                    <View style={styles.galleryStar}>
                      <Icon name="star" color={colors.surface} fill={colors.surface} size={12} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.badges}>
          <View style={[common.badge, dish.isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={[common.badgeText, dish.isAvailable ? styles.availableText : styles.unavailableText]}>
              {t(dish.isAvailable ? 'dish.available' : 'dish.unavailable')}
            </Text>
          </View>
          <View style={[common.badge, quick && styles.quickBadge]}>
            <Text style={[common.badgeText, quick && styles.quickText]}>{t(quick ? 'dish.quick' : 'dish.regular')}</Text>
          </View>
          {dish.syncStatus !== 'synced' && (
            <View style={[common.badge, styles.pendingBadge]}>
              <Icon name="cloudOff" color={colors.warning} size={12} />
              <Text style={[common.badgeText, styles.pendingText]}>{t('sync.notSynced')}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{dish.name}</Text>

        <View style={styles.info}>
          <InfoRow icon="tag" label={t('detail.price')} value={formatPrice(dish.price, language)} />
          <InfoRow
            icon="clock"
            label={t('detail.preparationTime')}
            value={`${t('dish.minutes', { count: dish.preparationTime })} · ${t(quick ? 'dish.quick' : 'dish.regular')}`}
            bordered
          />
          <InfoRow
            icon="layers"
            label={t('detail.category')}
            value={categoryName ?? t('dish.unknownCategory')}
            bordered
          />
        </View>

        <Text style={styles.sectionTitle}>{t('detail.description')}</Text>
        <Text style={styles.description}>{dish.description || t('detail.noDescription')}</Text>
      </ScrollView>

      <View style={[common.footer, styles.footerButtons]}>
        <Pressable
          style={({ pressed }) => [styles.footerButton, styles.editButton, pressed && common.pressed]}
          onPress={() => router.push({ pathname: '/dish-form', params: { id: dish.id } })}
          accessibilityRole="button"
        >
          <Icon name="edit" color={colors.primary} size={18} />
          <Text style={styles.editText}>{t('common.edit')}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.footerButton, styles.deleteButton, pressed && common.pressed]}
          onPress={() => {
            setDeleteError(undefined);
            setConfirmVisible(true);
          }}
          accessibilityRole="button"
        >
          <Icon name="trash" color={colors.danger} size={18} />
          <Text style={styles.deleteText}>{t('common.delete')}</Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title={t('detail.deleteTitle')}
        message={t('detail.deleteMessage')}
        subject={dish.name}
        thumbnail={thumbnailUrl ?? ''}
        busy={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}
