import { StyleSheet } from 'react-native';

import { colors } from './theme';

// Dùng chung cho hộp thoại xác nhận xóa và hộp thoại báo lỗi
export const styles = StyleSheet.create({
  // Nền mờ phủ kín màn hình, hộp thoại nằm giữa
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.scrim,
  },
  // maxWidth để màn hình rộng (web) hộp thoại không bị kéo giãn
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderRadius: 28,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: colors.dangerSoft,
  },
  title: {
    marginTop: 18,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.ink,
  },
  message: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },

  // Hộp thoại xác nhận xóa: khung nhỏ cho biết đang xóa món/loại món nào
  subject: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  subjectThumbnail: {
    width: 56,
    height: 36,
    borderRadius: 8,
  },
  subjectText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  error: {
    alignSelf: 'stretch',
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.danger,
  },
  buttons: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  button: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },

  // Hộp thoại báo lỗi: mỗi lỗi một dòng, bấm "Đã hiểu" để đóng
  alertTitle: {
    color: colors.danger,
  },
  alertMessages: {
    alignSelf: 'stretch',
    gap: 8,
    marginTop: 14,
  },
  alertRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alertBullet: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.danger,
  },
  alertMessage: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  alertButton: {
    alignSelf: 'stretch',
    height: 52,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
});
