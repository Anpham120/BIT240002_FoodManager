import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Màu nền và màu chữ đổi theo trạng thái (SyncBanner truyền vào)
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
