import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { styles } from '@/styles/field';
import { colors } from '@/styles/theme';

type FieldGroupProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

// Khung chung của một ô trong form: nhãn phía trên, dòng báo lỗi màu đỏ bên dưới
export function FieldGroup({ label, error, children }: FieldGroupProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

// Ô nhập chữ; có lỗi thì viền cũng đỏ
export function Field({ label, error, style, ...inputProps }: FieldProps) {
  return (
    <FieldGroup label={label} error={error}>
      <TextInput
        style={[styles.input, !!error && styles.inputError, style]}
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={label}
        {...inputProps}
      />
    </FieldGroup>
  );
}
