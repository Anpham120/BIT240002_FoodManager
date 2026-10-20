import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { LanguageToggle } from '@/components/LanguageToggle';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/StateView';
import { SyncBanner } from '@/components/SyncBanner';
import { Thumbnail } from '@/components/Thumbnail';
import { useData } from '@/context/DataContext';
import { useDishFilters } from '@/context/FilterContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSync } from '@/context/SyncContext';
import { PROJECT_NAME } from '@/db/schema';
import type { TranslationKey } from '@/i18n';
import { common } from '@/styles/common';
import { styles } from '@/styles/dishList';
import { colors } from '@/styles/theme';
import type { Dish, DishCategory } from '@/types';
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filterDishes,
  parsePriceRange,
  type DishFilters,
  type SortOption,
  type StatusFilter,
} from '@/utils/dishFilters';
import { getThumbnailUrl } from '@/utils/dishImages';
import { formatPrice, isQuickDish } from '@/utils/format';

const STATUS_OPTIONS: { value: StatusFilter; label: TranslationKey }[] = [
  { value: 'all', label: 'list.all' },
  { value: 'available', label: 'dish.available' },
  { value: 'unavailable', label: 'dish.unavailable' },
];

const SORT_OPTIONS: { value: SortOption; label: TranslationKey }[] = [
  { value: 'name', label: 'list.sortName' },
  { value: 'priceAsc', label: 'list.sortPriceAsc' },
  { value: 'priceDesc', label: 'list.sortPriceDesc' },
  { value: 'timeAsc', label: 'list.sortTimeAsc' },
];

function Separator() {
  return <View style={styles.separator} />;
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && common.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type FilterPanelProps = {
  filters: DishFilters;
  categories: DishCategory[];
  // Loại đang lọc (null nếu loại đã chọn vừa bị xóa)
  categoryId: string | null;
  priceError?: TranslationKey;
  onChange: (patch: Partial<DishFilters>) => void;
};

// Bảng lọc: loại món, trạng thái đang bán, khoảng giá, cách sắp xếp; các điều kiện áp dụng đồng thời
function FilterPanel({ filters, categories, categoryId, priceError, onChange }: FilterPanelProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{t('list.filters')}</Text>
        <Pressable
          style={({ pressed }) => [styles.resetButton, pressed && common.pressed]}
          onPress={() => onChange({ ...DEFAULT_FILTERS, query: filters.query })}
          accessibilityRole="button"
        >
          <Text style={styles.resetText}>{t('list.reset')}</Text>
        </Pressable>
      </View>

      <Text style={styles.groupLabel}>{t('list.category')}</Text>
      <View style={styles.chips}>
        <Chip label={t('list.all')} selected={categoryId === null} onPress={() => onChange({ categoryId: null })} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={categoryId === category.id}
            onPress={() => onChange({ categoryId: category.id })}
          />
        ))}
      </View>

      <Text style={styles.groupLabel}>{t('list.status')}</Text>
      <View style={styles.chips}>
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={t(option.label)}
            selected={filters.status === option.value}
            onPress={() => onChange({ status: option.value })}
          />
        ))}
      </View>

      <Text style={styles.groupLabel}>{t('list.priceRange')}</Text>
      <View style={styles.priceRow}>
        <TextInput
          style={[styles.priceInput, !!priceError && styles.priceInputError]}
          placeholder={t('list.minPrice')}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={`${t('list.priceRange')} ${t('list.minPrice')}`}
          value={filters.minPrice}
          onChangeText={(minPrice) => onChange({ minPrice })}
          keyboardType="number-pad"
        />
        <Text style={styles.priceDash}>–</Text>
        <TextInput
          style={[styles.priceInput, !!priceError && styles.priceInputError]}
          placeholder={t('list.maxPrice')}
          placeholderTextColor={colors.placeholder}
          accessibilityLabel={`${t('list.priceRange')} ${t('list.maxPrice')}`}
          value={filters.maxPrice}
          onChangeText={(maxPrice) => onChange({ maxPrice })}
          keyboardType="number-pad"
        />
      </View>
      {!!priceError && <Text style={styles.errorText}>{t(priceError)}</Text>}

      <Text style={styles.groupLabel}>{t('list.sort')}</Text>
      <View style={styles.chips}>
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={t(option.label)}
            selected={filters.sort === option.value}
            onPress={() => onChange({ sort: option.value })}
          />
        ))}
      </View>
    </View>
  );
}

type DishRowProps = {
  dish: Dish;
  // Tên loại tra theo dishCategoryId
  categoryName?: string;
  onPress: () => void;
};

// Một món: ảnh đại diện, tên, loại, trạng thái đang bán, thời gian chế biến (Nhanh/Thông thường), giá
function DishRow({ dish, categoryName, onPress }: DishRowProps) {
  const { t, language } = useLanguage();
  const quick = isQuickDish(dish.preparationTime);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && common.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Thumbnail uri={getThumbnailUrl(dish.images)} style={styles.thumbnail} />
      <View style={styles.rowText}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {categoryName ?? t('dish.unknownCategory')}
        </Text>
        <View style={styles.badges}>
          <View style={[common.badge, dish.isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={[common.badgeText, dish.isAvailable ? styles.availableText : styles.unavailableText]}>
              {t(dish.isAvailable ? 'dish.available' : 'dish.unavailable')}
            </Text>
          </View>
          <View style={[common.badge, quick && styles.quickBadge]}>
            <Icon name="clock" color={quick ? colors.primary : colors.label} size={12} />
            <Text style={[common.badgeText, quick && styles.quickText]}>
              {t('dish.minutes', { count: dish.preparationTime })} · {t(quick ? 'dish.quick' : 'dish.regular')}
            </Text>
          </View>
        </View>
        <View style={styles.rowFooter}>
          <Text style={styles.price}>{formatPrice(dish.price, language)}</Text>
          {dish.syncStatus !== 'synced' && (
            <View style={styles.pending}>
              <Icon name="cloudOff" color={colors.warning} size={14} />
              <Text style={styles.pendingText}>{t('sync.notSynced')}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// Màn hình danh sách món: tìm theo tên, lọc nhiều điều kiện, sắp xếp; điều kiện lưu ở FilterContext nên quay lại vẫn giữ
export default function DishListScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { dishes, categories } = useData();
  const { requestSync } = useSync();
  const { filters, setFilters } = useDishFilters();
  const [panelOpen, setPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const update = (patch: Partial<DishFilters>) => setFilters((current) => ({ ...current, ...patch }));

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  // Loại đang lọc vừa bị xóa thì coi như đang xem tất cả
  const categoryId = filters.categoryId !== null && categoryNames.has(filters.categoryId) ? filters.categoryId : null;
  const price = parsePriceRange(filters.minPrice, filters.maxPrice);
  const visibleDishes = filterDishes(dishes, { ...filters, categoryId }, price.range);
  const activeCount = countActiveFilters({ ...filters, categoryId });

  // Kéo danh sách xuống: đồng bộ ngay với MockAPI (nếu có mạng)
  const refresh = async () => {
    setRefreshing(true);
    await requestSync();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={common.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.project}>{PROJECT_NAME}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('list.title')}</Text>
          <Pressable
            style={({ pressed }) => [styles.categoriesButton, pressed && common.pressed]}
            onPress={() => router.push('/categories')}
            accessibilityRole="button"
          >
            <Icon name="layers" color={colors.primary} size={18} />
            <Text style={styles.categoriesText}>{t('list.categories')}</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{t('list.showing', { shown: visibleDishes.length, total: dishes.length })}</Text>
      </View>

      <SyncBanner />

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Icon name="search" color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('list.searchPlaceholder')}
            placeholderTextColor={colors.placeholder}
            accessibilityLabel={t('list.searchPlaceholder')}
            value={filters.query}
            onChangeText={(query) => update({ query })}
            autoCorrect={false}
            returnKeyType="search"
          />
          {filters.query.length > 0 && (
            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && common.pressed]}
              onPress={() => update({ query: '' })}
              accessibilityRole="button"
              accessibilityLabel={t('list.clearSearch')}
            >
              <Icon name="close" color={colors.muted} size={18} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={({ pressed }) => [styles.filterButton, panelOpen && styles.filterButtonActive, pressed && common.pressed]}
          onPress={() => setPanelOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={t('list.filters')}
          accessibilityState={{ expanded: panelOpen }}
        >
          <Icon name="sliders" color={panelOpen ? colors.surface : colors.primary} />
          {activeCount > 0 && (
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{activeCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        style={common.flex}
        contentContainerStyle={styles.listContent}
        data={visibleDishes}
        keyExtractor={(dish) => dish.id}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          panelOpen ? (
            <FilterPanel
              filters={filters}
              categories={categories}
              categoryId={categoryId}
              priceError={price.error}
              onChange={update}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <DishRow
            dish={item}
            categoryName={categoryNames.get(item.dishCategoryId)}
            onPress={() => router.push({ pathname: '/dish/[id]', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          dishes.length === 0 ? (
            <EmptyState icon="coffee" title={t('list.emptyTitle')} hint={t('list.emptyHint')} />
          ) : (
            <EmptyState icon="search" title={t('list.noMatchTitle')} hint={t('list.noMatchHint')} />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      <View style={common.footer}>
        <PrimaryButton label={t('list.add')} icon="plus" onPress={() => router.push('/dish-form')} />
      </View>
    </SafeAreaView>
  );
}
