import type { Dish } from '@/types';

import { countActiveFilters, DEFAULT_FILTERS, filterDishes, parsePriceRange } from './dishFilters';

function dish(id: string, name: string, price: number, preparationTime: number, dishCategoryId: string, isAvailable = true): Dish {
  return { id, name, price, preparationTime, isAvailable, description: '', dishCategoryId, images: [], syncStatus: 'synced' };
}

const DISHES = [
  dish('1', 'Phở bò', 55000, 15, 'main'),
  dish('2', 'Bún thịt nướng', 50000, 20, 'main'),
  dish('3', 'Gỏi cuốn', 35000, 10, 'starter'),
  dish('4', 'Gỏi gà', 45000, 25, 'starter', false),
  dish('5', 'Cà phê sữa đá', 25000, 5, 'drink'),
];

const names = (list: Dish[]) => list.map((item) => item.name);
const run = (filters: Partial<typeof DEFAULT_FILTERS>) => {
  const all = { ...DEFAULT_FILTERS, ...filters };
  return names(filterDishes(DISHES, all, parsePriceRange(all.minPrice, all.maxPrice).range));
};

describe('filterDishes', () => {
  it('mặc định hiện tất cả, xếp theo tên', () => {
    expect(run({})).toEqual(['Bún thịt nướng', 'Cà phê sữa đá', 'Gỏi cuốn', 'Gỏi gà', 'Phở bò']);
  });

  it('tìm theo một phần tên, không phân biệt dấu và hoa thường', () => {
    expect(run({ query: 'goi' })).toEqual(['Gỏi cuốn', 'Gỏi gà']);
    expect(run({ query: 'PHỞ' })).toEqual(['Phở bò']);
  });

  it('món ngừng bán vẫn có trong danh sách nhưng không có khi lọc đang bán', () => {
    expect(run({})).toContain('Gỏi gà');
    expect(run({ status: 'available' })).not.toContain('Gỏi gà');
    expect(run({ status: 'unavailable' })).toEqual(['Gỏi gà']);
  });

  it('phối hợp đồng thời: tên + loại + đang bán + khoảng giá', () => {
    expect(run({ query: 'g', categoryId: 'starter', status: 'available', minPrice: '30000', maxPrice: '40000' })).toEqual([
      'Gỏi cuốn',
    ]);
  });

  it('sắp xếp theo giá tăng, giá giảm, thời gian chế biến tăng', () => {
    expect(run({ sort: 'priceAsc' })).toEqual(['Cà phê sữa đá', 'Gỏi cuốn', 'Gỏi gà', 'Bún thịt nướng', 'Phở bò']);
    expect(run({ sort: 'priceDesc' })).toEqual(['Phở bò', 'Bún thịt nướng', 'Gỏi gà', 'Gỏi cuốn', 'Cà phê sữa đá']);
    expect(run({ sort: 'timeAsc' })).toEqual(['Cà phê sữa đá', 'Gỏi cuốn', 'Phở bò', 'Bún thịt nướng', 'Gỏi gà']);
  });
});

describe('parsePriceRange', () => {
  it('ô trống = không giới hạn', () => {
    expect(parsePriceRange('', '')).toEqual({ range: { min: undefined, max: undefined } });
    expect(parsePriceRange('30.000', '')).toEqual({ range: { min: 30000, max: undefined } });
  });

  it('khoảng giá không hợp lệ thì báo lỗi và không lọc theo giá', () => {
    expect(parsePriceRange('50000', '20000')).toEqual({ range: {}, error: 'errors.priceRangeOrder' });
    expect(parsePriceRange('abc', '')).toEqual({ range: {}, error: 'errors.priceRangeInvalid' });
    expect(parsePriceRange('', '-1')).toEqual({ range: {}, error: 'errors.priceRangeInvalid' });
    expect(run({ minPrice: '50000', maxPrice: '20000' })).toHaveLength(5);
  });
});

describe('countActiveFilters', () => {
  it('đếm loại, trạng thái, khoảng giá đang bật', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...DEFAULT_FILTERS, categoryId: 'main', status: 'available', maxPrice: '50000' })).toBe(3);
  });
});
