import { translate } from '@/i18n';

import { formatPrice, isQuickDish, normalizeText } from './format';

describe('isQuickDish', () => {
  it('≤ 15 phút là Quick / Nhanh, còn lại là Regular / Thông thường', () => {
    expect(isQuickDish(5)).toBe(true);
    expect(isQuickDish(15)).toBe(true);
    expect(isQuickDish(16)).toBe(false);
  });
});

describe('formatPrice', () => {
  it('định dạng theo ngôn ngữ', () => {
    expect(formatPrice(55000, 'en')).toBe('55,000 VND');
    expect(formatPrice(1250000, 'vi')).toBe('1.250.000 đ');
  });
});

describe('normalizeText', () => {
  it('bỏ dấu tiếng Việt, kể cả chữ đ', () => {
    expect(normalizeText('  Cà Phê   Sữa Đá ')).toBe('ca phe sua da');
  });
});

describe('translate', () => {
  it('mặc định tiếng Anh, chuyển được sang tiếng Việt, thay {tham số}', () => {
    expect(translate('en', 'dish.quick')).toBe('Quick');
    expect(translate('vi', 'dish.quick')).toBe('Nhanh');
    expect(translate('vi', 'dish.regular')).toBe('Thông thường');
    expect(translate('vi', 'dish.minutes', { count: 15 })).toBe('15 phút');
    expect(translate('en', 'errors.server', { status: 500 })).toBe('MockAPI returned an error (HTTP 500).');
  });
});
