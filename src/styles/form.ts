import { StyleSheet } from 'react-native';

import { colors } from './theme';

// Dùng chung cho form món và form loại món
export const styles = StyleSheet.create({
  // flexGrow: nội dung cao ít nhất bằng vùng cuộn; gap giữa các ô nhập
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  // Giá và thời gian chế biến nằm cạnh nhau, mỗi ô một nửa
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  textArea: {
    height: 112,
    paddingTop: 14,
    paddingBottom: 14,
  },
  // Dòng bật/tắt "Đang bán"
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
  },

  // Danh sách ảnh của món
  images: {
    gap: 8,
  },
  imagesEmpty: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  imageRowThumbnail: {
    borderColor: colors.primary,
  },
  imageThumb: {
    width: 64,
    height: 48,
    borderRadius: 8,
  },
  imageText: {
    flex: 1,
    gap: 2,
  },
  imageUrl: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.label,
  },
  thumbnailLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  // Vùng chạm 44x44 cho nút ngôi sao và nút xóa ảnh
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  // Ô nhập link ảnh và nút Thêm
  addImageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  addImageInput: {
    flex: 1,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  addImageText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
