import type { TranslationKey } from '@/i18n';
import type { Dish } from '@/types';

import { normalizeText } from './format';
import { parsePrice } from './validation';

export type StatusFilter = 'all' | 'available' | 'unavailable';
export type SortOption = 'name' | 'priceAsc' | 'priceDesc' | 'timeAsc';

// Các điều kiện ở màn hình danh sách; ô giá giữ nguyên chữ người dùng gõ
export type DishFilters = {
  // Một phần tên món
  query: string;
  // null = mọi loại món
  categoryId: string | null;
  status: StatusFilter;
  minPrice: string;
  maxPrice: string;
  sort: SortOption;
};

export const DEFAULT_FILTERS: DishFilters = {
  query: '',
  categoryId: null,
  status: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'name',
};

export type PriceRange = { min?: number; max?: number };

// Đọc khoảng giá; ô bỏ trống = không giới hạn.
// Không hợp lệ (không phải số nguyên ≥ 0, hoặc Từ > Đến) thì trả về lỗi và không lọc theo giá
export function parsePriceRange(minText: string, maxText: string): { range: PriceRange; error?: TranslationKey } {
  const min = minText.trim() ? parsePrice(minText) : undefined;
  const max = maxText.trim() ? parsePrice(maxText) : undefined;
  const invalid = (text: string, value?: number) => !!text.trim() && (value === undefined || value < 0);
  if (invalid(minText, min) || invalid(maxText, max)) return { range: {}, error: 'errors.priceRangeInvalid' };
  if (min !== undefined && max !== undefined && min > max) return { range: {}, error: 'errors.priceRangeOrder' };
  return { range: { min, max } };
}

function compareNames(a: Dish, b: Dish): number {
  const x = normalizeText(a.name);
  const y = normalizeText(b.name);
  if (x === y) return 0;
  return x < y ? -1 : 1;
}

// Cùng giá / cùng thời gian thì xếp theo tên
const SORTERS: Record<SortOption, (a: Dish, b: Dish) => number> = {
  name: compareNames,
  priceAsc: (a, b) => a.price - b.price || compareNames(a, b),
  priceDesc: (a, b) => b.price - a.price || compareNames(a, b),
  timeAsc: (a, b) => a.preparationTime - b.preparationTime || compareNames(a, b),
};

// Áp dụng đồng thời mọi điều kiện (tên, loại, trạng thái đang bán, khoảng giá) rồi sắp xếp
export function filterDishes(dishes: Dish[], filters: DishFilters, range: PriceRange): Dish[] {
  const keyword = normalizeText(filters.query);
  return dishes
    .filter((dish) => !keyword || normalizeText(dish.name).includes(keyword))
    .filter((dish) => filters.categoryId === null || dish.dishCategoryId === filters.categoryId)
    .filter((dish) => filters.status === 'all' || dish.isAvailable === (filters.status === 'available'))
    .filter((dish) => (range.min === undefined || dish.price >= range.min) && (range.max === undefined || dish.price <= range.max))
    .sort(SORTERS[filters.sort]);
}

// Số điều kiện lọc đang bật (loại, trạng thái, khoảng giá), hiện trên nút Bộ lọc
export function countActiveFilters(filters: DishFilters): number {
  return [filters.categoryId !== null, filters.status !== 'all', !!(filters.minPrice.trim() || filters.maxPrice.trim())].filter(
    Boolean,
  ).length;
}
