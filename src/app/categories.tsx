import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/AlertDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { EmptyState } from '@/components/StateView';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/categories';
import { common } from '@/styles/common';
import { colors } from '@/styles/theme';
import type { DishCategory } from '@/types';

function Separator() {
  return <View style={styles.separator} />;
}

type CategoryRowProps = {
  category: DishCategory;
  dishCount: number;
  onEdit: () => void;
  onDelete: () => void;
};

// Một loại món: tên, mô tả, số món đang dùng; hai nút sửa/xóa bên phải
function CategoryRow({ category, dishCount, onEdit, onDelete }: CategoryRowProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Icon name="layers" color={colors.primary} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.name}>{category.name}</Text>
        {!!category.description && (
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        )}
        <View style={styles.badges}>
          <View style={common.badge}>
            <Text style={common.badgeText}>{t('categories.dishCount', { count: dishCount })}</Text>
          </View>
          {category.syncStatus !== 'synced' && (
            <View style={[common.badge, styles.pendingBadge]}>
              <Icon name="cloudOff" color={colors.warning} size={12} />
              <Text style={[common.badgeText, styles.pendingText]}>{t('sync.notSynced')}</Text>
            </View>
          )}
        </View>
      </View>
      <View>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && common.pressed]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t('categories.edit', { name: category.name })}
        >
          <View style={[styles.actionTile, styles.editTile]}>
            <Icon name="edit" color={colors.primary} />
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.action, pressed && common.pressed]}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={t('categories.delete', { name: category.name })}
        >
          <View style={[styles.actionTile, styles.deleteTile]}>
            <Icon name="trash" color={colors.danger} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// Màn hình quản lý loại món: xem, thêm, sửa, xóa. Không cho xóa loại món đang có món sử dụng
export default function CategoriesScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { categories, dishes, deleteCategory } = useData();
  // Loại đang chọn để xóa; giữ lại sau khi đóng hộp thoại để lúc mờ dần nội dung không bị trống
  const [target, setTarget] = useState<DishCategory | null>(null);
  // Số món đang dùng loại bị chặn xóa
  const [usedBy, setUsedBy] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [blockedVisible, setBlockedVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const countDishes = (categoryId: string) => dishes.filter((dish) => dish.dishCategoryId === categoryId).length;

  // Loại đang có món dùng thì báo không xóa được, ngược lại hỏi xác nhận
  const askDelete = (category: DishCategory) => {
    setTarget(category);
    const count = countDishes(category.id);
    if (count > 0) {
      setUsedBy(count);
      setBlockedVisible(true);
      return;
    }
    setDeleteError(undefined);
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (!target) return;
    setDeleting(true);
    setDeleteError(undefined);
    try {
      // Kiểm tra lại trong SQLite ngay lúc xóa (dữ liệu có thể vừa đổi do đồng bộ)
      const count = await deleteCategory(target.id);
      setConfirmVisible(false);
      if (count > 0) {
        setUsedBy(count);
        setBlockedVisible(true);
      }
    } catch {
      setDeleteError(t('errors.saveFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <ScreenHeader title={t('categories.title')} />

      <FlatList
        style={common.flex}
        contentContainerStyle={styles.listContent}
        data={categories}
        keyExtractor={(category) => category.id}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <CategoryRow
            category={item}
            dishCount={countDishes(item.id)}
            onEdit={() => router.push({ pathname: '/category-form', params: { id: item.id } })}
            onDelete={() => askDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="layers" title={t('categories.emptyTitle')} hint={t('categories.emptyHint')} />
        }
      />

      <View style={common.footer}>
        <PrimaryButton label={t('categories.add')} icon="plus" onPress={() => router.push('/category-form')} />
      </View>

      {target && (
        <>
          <ConfirmDialog
            visible={confirmVisible}
            title={t('categories.deleteTitle')}
            message={t('categories.deleteMessage')}
            subject={target.name}
            busy={deleting}
            error={deleteError}
            onConfirm={handleDelete}
            onCancel={() => setConfirmVisible(false)}
          />
          <AlertDialog
            visible={blockedVisible}
            title={t('categories.inUseTitle')}
            messages={[t('categories.inUseMessage', { name: target.name, count: usedBy }), t('categories.inUseHint')]}
            onClose={() => setBlockedVisible(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
