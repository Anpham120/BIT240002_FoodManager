import type { Language } from '@/i18n';

// Món có thời gian chế biến từ 15 phút trở xuống là "Quick / Nhanh", còn lại là "Regular / Thông thường".
// Tính lúc hiển thị, không lưu thêm thuộc tính phân loại
export const QUICK_MAX_MINUTES = 15;

export function isQuickDish(preparationTime: number): boolean {
  return preparationTime <= QUICK_MAX_MINUTES;
}

// 55000 -> "55,000 VND" (English) hoặc "55.000 đ" (Tiếng Việt)
export function formatPrice(price: number, language: Language): string {
  const digits = String(Math.round(price)).replace(/\B(?=(\d{3})+(?!\d))/g, language === 'vi' ? '.' : ',');
  return language === 'vi' ? `${digits} đ` : `${digits} VND`;
}

// Bỏ dấu, viết thường, gộp dấu cách để gõ "pho" vẫn tìm ra "Phở"
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}
