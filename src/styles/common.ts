import { StyleSheet } from 'react-native';

import { colors } from './theme';

// Phần giống nhau ở mọi màn hình: nền, thanh nút dưới đáy, nút chính, nhãn nhỏ, hiệu ứng khi bấm
export const common = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  // Nhãn nhỏ bo góc: loại món, trạng thái, Nhanh/Thông thường, chưa đồng bộ
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.chip,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.label,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
