import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  // Nằm giữa phần còn trống của màn hình
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  icon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    backgroundColor: colors.primarySoft,
  },
  errorIcon: {
    backgroundColor: colors.dangerSoft,
  },
  title: {
    marginTop: 20,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.ink,
  },
  hint: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.muted,
  },
  loadingHint: {
    marginTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    marginTop: 20,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
