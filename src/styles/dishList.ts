import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  header: {
    gap: 2,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Tên project (có MSSV) ở trên tiêu đề
  project: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.primary,
  },
  title: {
    flex: 1,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.muted,
  },
  // Nút sang màn hình quản lý loại món
  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  categoriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Ô tìm kiếm và nút mở bảng lọc
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingLeft: 14,
    paddingRight: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.ink,
  },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  // Số điều kiện lọc đang bật, ở góc nút lọc
  filterCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.danger,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },

  // Bảng lọc nằm đầu danh sách, cuộn cùng danh sách
  panel: {
    gap: 8,
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  resetButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  groupLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.label,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    // TextInput có chiều rộng tối thiểu mặc định nên không co lại khi màn hình hẹp; minWidth: 0 cho phép co
    minWidth: 0,
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.ink,
  },
  priceInputError: {
    borderColor: colors.danger,
  },
  priceDash: {
    fontSize: 16,
    color: colors.muted,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },

  // flexGrow để thông báo rỗng nằm giữa vùng danh sách
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  separator: {
    height: 12,
  },
  // Một món: ảnh bên trái, thông tin bên phải
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  rowText: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  dishName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  category: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  rowFooter: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  // Món còn thay đổi chưa gửi lên MockAPI
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
  },
});
