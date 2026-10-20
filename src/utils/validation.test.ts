import type { Dish, DishCategory } from '@/types';

import {
  parseMinutes,
  parsePrice,
  toDishInput,
  validateCategoryForm,
  validateDishForm,
  validateImageUrl,
  validatePreparationTime,
  validatePrice,
  type DishFormValues,
} from './validation';

const CATEGORIES: DishCategory[] = [
  { id: 'c1', name: 'Món chính', description: '', syncStatus: 'synced' },
  { id: 'c2', name: 'Đồ uống', description: '', syncStatus: 'synced' },
];

const PHO: Dish = {
  id: 'd1',
  name: 'Phở bò',
  price: 55000,
  preparationTime: 15,
  isAvailable: true,
  description: '',
  dishCategoryId: 'c1',
  images: [],
  syncStatus: 'synced',
};

const VALID: DishFormValues = {
  name: 'Bún chả',
  dishCategoryId: 'c1',
  price: '45000',
  preparationTime: '20',
  isAvailable: true,
  description: '',
  images: [],
};

describe('parsePrice / validatePrice (Price > 0)', () => {
  it.each([
    ['45000', 45000],
    ['45.000', 45000],
    ['1,250,000', 1250000],
    ['1 250 000', 1250000],
  ])('đọc "%s" thành %i', (text, value) => {
    expect(parsePrice(text)).toBe(value);
    expect(validatePrice(text)).toBeUndefined();
  });

  it('báo thiếu khi rỗng', () => {
    expect(validatePrice('  ')).toBe('errors.priceRequired');
  });

  it.each(['abc', '12a', '45.5', '1.25.000'])('"%s" không phải số nguyên', (text) => {
    expect(validatePrice(text)).toBe('errors.priceInvalid');
  });

  it.each(['0', '-5000'])('"%s" không lớn hơn 0', (text) => {
    expect(validatePrice(text)).toBe('errors.pricePositive');
  });
});

describe('parseMinutes / validatePreparationTime (PreparationTime > 0)', () => {
  it('đọc số phút nguyên', () => {
    expect(parseMinutes(' 15 ')).toBe(15);
    expect(validatePreparationTime('15')).toBeUndefined();
  });

  it.each([
    ['', 'errors.preparationTimeRequired'],
    ['1.5', 'errors.preparationTimeInvalid'],
    ['abc', 'errors.preparationTimeInvalid'],
    ['0', 'errors.preparationTimePositive'],
    ['-3', 'errors.preparationTimePositive'],
  ])('"%s" -> %s', (text, error) => {
    expect(validatePreparationTime(text)).toBe(error);
  });
});

describe('validateDishForm', () => {
  it('không có lỗi khi mọi ô hợp lệ', () => {
    expect(validateDishForm(VALID, CATEGORIES, [PHO])).toEqual({});
  });

  it('báo lỗi đúng từng ô: tên rỗng, chưa chọn loại, giá và thời gian sai', () => {
    expect(validateDishForm({ ...VALID, name: ' ', dishCategoryId: '', price: '0', preparationTime: 'x' }, CATEGORIES, [])).toEqual({
      name: 'errors.dishNameRequired',
      dishCategoryId: 'errors.categoryRequired',
      price: 'errors.pricePositive',
      preparationTime: 'errors.preparationTimeInvalid',
    });
  });

  it('DishCategoryId không tồn tại', () => {
    expect(validateDishForm({ ...VALID, dishCategoryId: 'c9' }, CATEGORIES, []).dishCategoryId).toBe('errors.categoryInvalid');
  });

  it.each(['Phở bò', 'PHỞ BÒ', '  phở   bò '])('tên "%s" trùng món khác trong cùng loại', (name) => {
    expect(validateDishForm({ ...VALID, name }, CATEGORIES, [PHO]).name).toBe('errors.dishNameDuplicate');
  });

  it('cùng tên nhưng khác loại thì hợp lệ', () => {
    expect(validateDishForm({ ...VALID, name: 'Phở bò', dishCategoryId: 'c2' }, CATEGORIES, [PHO]).name).toBeUndefined();
  });

  it('khi sửa, không tính trùng với chính món đang sửa', () => {
    expect(validateDishForm({ ...VALID, name: 'Phở bò' }, CATEGORIES, [PHO], 'd1').name).toBeUndefined();
  });
});

describe('validateImageUrl', () => {
  const images = [{ imageUrl: 'https://example.com/a.jpg', isThumbnail: true }];

  it('chấp nhận link http/https mới', () => {
    expect(validateImageUrl(' https://example.com/b.jpg ', images)).toBeUndefined();
  });

  it.each([
    ['', 'errors.imageUrlRequired'],
    ['example.com/a.jpg', 'errors.imageUrlInvalid'],
    ['ftp://example.com/a.jpg', 'errors.imageUrlInvalid'],
    ['https://example.com/a.jpg', 'errors.imageUrlDuplicate'],
  ])('"%s" -> %s', (url, error) => {
    expect(validateImageUrl(url, images)).toBe(error);
  });
});

describe('validateCategoryForm', () => {
  it('báo thiếu tên và tên trùng (không phân biệt hoa thường)', () => {
    expect(validateCategoryForm({ name: ' ', description: '' }, CATEGORIES).name).toBe('errors.categoryNameRequired');
    expect(validateCategoryForm({ name: 'đồ UỐNG', description: '' }, CATEGORIES).name).toBe('errors.categoryNameDuplicate');
    expect(validateCategoryForm({ name: 'Đồ uống', description: '' }, CATEGORIES, 'c2').name).toBeUndefined();
  });
});

describe('toDishInput', () => {
  it('gộp dấu cách thừa, đổi giá và thời gian sang số', () => {
    expect(toDishInput({ ...VALID, name: '  Bún   chả ', price: '45.000', preparationTime: '20' })).toEqual({
      name: 'Bún chả',
      price: 45000,
      preparationTime: 20,
      isAvailable: true,
      description: '',
      dishCategoryId: 'c1',
      images: [],
    });
  });
});
