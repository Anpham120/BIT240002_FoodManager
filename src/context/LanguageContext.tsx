import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { translate, type Language, type TranslationKey, type TranslationParams } from '@/i18n';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  // Hàm dịch theo ngôn ngữ đang chọn
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Ngôn ngữ mặc định là tiếng Anh. State nằm ở gốc ứng dụng (bọc mọi màn hình)
// nên chuyển qua lại giữa các màn hình vẫn giữ ngôn ngữ đã chọn
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: (key, params) => translate(language, key, params) }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
