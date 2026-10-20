// Kiểm tra dữ liệu form món ăn và form loại món trước khi lưu.
// Mỗi hàm trả về khóa dịch của câu báo lỗi (hiện theo ngôn ngữ đang chọn); hợp lệ thì trả về undefined.

import type { TranslationKey } from '@/i18n';
import type { Dish, DishCategory, DishCategoryInput, DishImage, DishInput } from '@/types';

// Giá trị các ô của form món; giá và thời gian vẫn là chữ người dùng gõ
export type DishFormValues = {
  name: string;
  dishCategoryId: string;
  price: string;
  preparationTime: string;
  isAvailable: boolean;
  description: string;
  images: DishImage[];
};

export type DishFormErrors = Partial<Record<'name' | 'dishCategoryId' | 'price' | 'preparationTime', TranslationKey>>;

export type CategoryFormValues = {
  name: string;
  description: string;
};

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, TranslationKey>>;

// Link bắt đầu bằng http:// hoặc https://, tên miền có dấu chấm, không chứa dấu cách
const URL_PATTERN = /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/i;
// Số nguyên, cho phép dấu phân cách hàng nghìn: 45000, 45.000, 45,000, 1 250 000
const PRICE_PATTERN = /^-?(\d+|\d{1,3}([.,\s]\d{3})+)$/;
const MINUTES_PATTERN = /^-?\d+$/;

// Bỏ dấu cách ở hai đầu và gộp nhiều dấu cách liền nhau thành một
export function collapseSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// Dạng so sánh tên: không phân biệt hoa thường và dấu cách thừa
function nameKey(text: string): string {
  return collapseSpaces(text).normalize('NFC').toLowerCase();
}

export function isHttpUrl(text: string): boolean {
  return URL_PATTERN.test(text.trim());
}

// Giá tính bằng đồng nên là số nguyên; dấu chấm, phẩy, cách chỉ là phân cách hàng nghìn (45.000 = 45000)
export function parsePrice(text: string): number | undefined {
  const value = text.trim();
  return PRICE_PATTERN.test(value) ? Number(value.replace(/[.,\s]/g, '')) : undefined;
}

// Thời gian chế biến: số phút nguyên
export function parseMinutes(text: string): number | undefined {
  const value = text.trim();
  return MINUTES_PATTERN.test(value) ? Number(value) : undefined;
}

// Tên món không rỗng và không trùng với món khác trong cùng loại
export function validateDishName(
  name: string,
  dishCategoryId: string,
  dishes: Dish[],
  editingId?: string,
): TranslationKey | undefined {
  const key = nameKey(name);
  if (!key) return 'errors.dishNameRequired';
  const duplicate = dishes.some(
    (dish) => dish.id !== editingId && dish.dishCategoryId === dishCategoryId && nameKey(dish.name) === key,
  );
  return duplicate ? 'errors.dishNameDuplicate' : undefined;
}

// DishCategoryId hợp lệ: đã chọn và có trong danh sách loại món đang lưu
export function validateCategoryId(dishCategoryId: string, categories: DishCategory[]): TranslationKey | undefined {
  if (!dishCategoryId) return 'errors.categoryRequired';
  if (!categories.some((category) => category.id === dishCategoryId)) return 'errors.categoryInvalid';
  return undefined;
}

export function validatePrice(text: string): TranslationKey | undefined {
  if (!text.trim()) return 'errors.priceRequired';
  const price = parsePrice(text);
  if (price === undefined) return 'errors.priceInvalid';
  if (price <= 0) return 'errors.pricePositive';
  return undefined;
}

export function validatePreparationTime(text: string): TranslationKey | undefined {
  if (!text.trim()) return 'errors.preparationTimeRequired';
  const minutes = parseMinutes(text);
  if (minutes === undefined) return 'errors.preparationTimeInvalid';
  if (minutes <= 0) return 'errors.preparationTimePositive';
  return undefined;
}

// Thứ tự lỗi theo thứ tự các ô trên form
export function validateDishForm(
  values: DishFormValues,
  categories: DishCategory[],
  dishes: Dish[],
  editingId?: string,
): DishFormErrors {
  return {
    name: validateDishName(values.name, values.dishCategoryId, dishes, editingId),
    dishCategoryId: validateCategoryId(values.dishCategoryId, categories),
    price: validatePrice(values.price),
    preparationTime: validatePreparationTime(values.preparationTime),
  };
}

// Link ảnh muốn thêm: không rỗng, đúng dạng http(s), chưa có trong danh sách ảnh của món
export function validateImageUrl(text: string, images: DishImage[]): TranslationKey | undefined {
  const url = text.trim();
  if (!url) return 'errors.imageUrlRequired';
  if (!isHttpUrl(url)) return 'errors.imageUrlInvalid';
  if (images.some((image) => image.imageUrl === url)) return 'errors.imageUrlDuplicate';
  return undefined;
}

// Tên loại món không rỗng và không trùng loại khác (khi sửa thì bỏ qua chính loại đang sửa)
export function validateCategoryForm(
  values: CategoryFormValues,
  categories: DishCategory[],
  editingId?: string,
): CategoryFormErrors {
  const key = nameKey(values.name);
  let name: TranslationKey | undefined;
  if (!key) name = 'errors.categoryNameRequired';
  else if (categories.some((category) => category.id !== editingId && nameKey(category.name) === key)) {
    name = 'errors.categoryNameDuplicate';
  }
  return { name };
}

export function hasErrors(errors: DishFormErrors | CategoryFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// Các lỗi theo thứ tự trên form, để liệt kê trong hộp thoại
export function errorKeys(errors: DishFormErrors | CategoryFormErrors): TranslationKey[] {
  return Object.values(errors).filter((key): key is TranslationKey => !!key);
}

// Chuyển dữ liệu form (đã hợp lệ) sang dữ liệu lưu: giá, thời gian thành số
export function toDishInput(values: DishFormValues): DishInput {
  return {
    name: collapseSpaces(values.name),
    price: parsePrice(values.price) ?? 0,
    preparationTime: parseMinutes(values.preparationTime) ?? 0,
    isAvailable: values.isAvailable,
    description: values.description.trim(),
    dishCategoryId: values.dishCategoryId,
    images: values.images,
  };
}

export function toCategoryInput(values: CategoryFormValues): DishCategoryInput {
  return {
    name: collapseSpaces(values.name),
    description: values.description.trim(),
  };
}
