import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  // Kích thước và bo góc do nơi dùng truyền vào; overflow hidden để ảnh bo theo khung
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    backgroundColor: colors.chip,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  status: {
    paddingHorizontal: 16,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.muted,
  },
});
