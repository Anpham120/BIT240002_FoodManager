import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  // Hai nút EN | VI liền nhau trong một khung bo tròn
  toggle: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  option: {
    minWidth: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.label,
  },
  optionTextSelected: {
    color: colors.surface,
  },
});
