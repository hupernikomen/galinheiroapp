import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';

/**
 * Picker padrão do app.
 *
 * Uso:
 * <PickerCampo
 *   label="Tipo"
 *   selectedValue={tipo}
 *   onValueChange={setTipo}
 *   items={[
 *     { label: 'Ração', value: 'racao' },
 *     { label: 'Cartela', value: 'cartela' },
 *   ]}
 * />
 *
 * Ou com placeholder:
 * <PickerCampo
 *   selectedValue={estoqueId}
 *   onValueChange={setEstoqueId}
 *   placeholder="Selecione o estoque"
 *   items={lista.map(i => ({ label: i.nome, value: i.id }))}
 * />
 */
export default function PickerCampo({
  label,
  selectedValue,
  onValueChange,
  items = [],
  placeholder,
  enabled = true,
  style,
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
            opacity: enabled ? 1 : 0.55,
          },
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={enabled}
          style={styles.picker}
          dropdownIconColor={colors.principal || '#333'}
        >
          {!!placeholder && (
            <Picker.Item label={placeholder} value="" color="#999" />
          )}
          {items.map((item) => (
            <Picker.Item
              key={String(item.value)}
              label={item.label}
              value={item.value}
              color="#222"
            />
          ))}
        </Picker>
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
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal:14
  },
  picker: {
    height: 55,
    width: '100%',
  },
});