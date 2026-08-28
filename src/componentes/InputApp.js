import { TextInput, StyleSheet } from 'react-native';

export default function InputApp({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  style,
  ...rest
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
      underlineColorAndroid="transparent"
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#22222215',
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
});