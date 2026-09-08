import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function InputCampo({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  maxLength,
  multiline = false,
  numberOfLines,
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  ...rest
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.neutro,
            opacity: editable ? 1 : 0.55,
            minHeight: multiline ? Math.max(80, 24 * (numberOfLines || 3)) : 55,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCapitalize={autoCapitalize}
          underlineColorAndroid="transparent"
          textAlignVertical={multiline ? 'top' : 'center'}
          includeFontPadding={false}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
    marginLeft: 4,
  },
  box: {
    borderRadius: 30,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Roboto-Regular',
    // Android: evita texto “subindo”
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputMultiline: {
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
});