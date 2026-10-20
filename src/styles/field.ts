import { StyleSheet } from 'react-native';

import { colors } from './theme';

// Ô nhập trong form và ô chọn loại món
export const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.label,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },

  // Ô chọn loại món trông như ô nhập, có mũi tên bên phải
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.placeholder,
  },

  // Bảng chọn loại món mở ra giữa màn hình
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.scrim,
  },
  // Lớp bấm được phủ kín nền mờ: bấm ra ngoài bảng chọn để đóng
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
    paddingTop: 22,
    paddingBottom: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  sheetTitle: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.ink,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  optionSelected: {
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  optionsEmpty: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },
});
