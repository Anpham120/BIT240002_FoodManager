import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  // Khung ảnh lớn tỉ lệ 4:3
  cover: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
  },
  // Nhãn "Ảnh đại diện" ở góc khung ảnh lớn
  coverBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  coverBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
  sectionLabel: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.label,
  },
  noImages: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  // Dải ảnh nhỏ cuộn ngang; bấm một ảnh để xem ở khung lớn
  gallery: {
    gap: 10,
    paddingTop: 8,
  },
  galleryItem: {
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 14,
  },
  galleryItemSelected: {
    borderColor: colors.primary,
  },
  galleryImage: {
    width: 76,
    height: 76,
    borderRadius: 10,
  },
  galleryStar: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.primary,
  },

  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 18,
  },
  availableBadge: {
    backgroundColor: colors.successSoft,
  },
  availableText: {
    color: colors.success,
  },
  unavailableBadge: {
    backgroundColor: colors.dangerSoft,
  },
  unavailableText: {
    color: colors.danger,
  },
  quickBadge: {
    backgroundColor: colors.primarySoft,
  },
  quickText: {
    color: colors.primary,
  },
  pendingBadge: {
    backgroundColor: colors.warningSoft,
  },
  pendingText: {
    color: colors.warning,
  },
  title: {
    marginTop: 8,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.ink,
  },

  // Bảng thông tin: mỗi dòng một biểu tượng, nhãn và giá trị
  info: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  infoIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    color: colors.label,
  },

  // Thanh dưới cùng: nút Sửa và Xóa nằm cạnh nhau
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderWidth: 1.5,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  editButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: colors.danger,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
});
