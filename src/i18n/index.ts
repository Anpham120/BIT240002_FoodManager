import { en } from './en';
import { vi } from './vi';

export type Language = 'en' | 'vi';

const dictionaries = { en, vi };

// Mọi khóa dịch dạng "nhóm.khóa" (vd: 'list.title'); gõ sai khóa thì TypeScript báo lỗi
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<typeof en>;
export type TranslationParams = Record<string, string | number>;

// Thông báo chưa dịch (khóa + tham số): lưu dạng này, đến lúc hiển thị mới dịch nên đổi ngôn ngữ là đổi theo
export type Message = { key: TranslationKey; params?: TranslationParams };

// Lấy câu theo ngôn ngữ và thay {tham số}; thiếu bản dịch thì hiện chính khóa để dễ phát hiện
export function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
  let node: unknown = dictionaries[language];
  for (const part of key.split('.')) node = (node as Record<string, unknown> | undefined)?.[part];
  const text = typeof node === 'string' ? node : key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
