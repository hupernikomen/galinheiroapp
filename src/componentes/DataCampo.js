import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

/**
 * Seletor de data padrão do app.
 *
 * Uso:
 * const [data, setData] = useState(new Date());
 *
 * <DataCampo
 *   label="Data"
 *   value={data}
 *   onChange={setData}
 * />
 *
 * <DataCampo
 *   value={data}
 *   onChange={setData}
 *   maximumDate={new Date()}
 * />
 */
export default function DataCampo({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  disabled = false,
  style,
}) {
  const { colors } = useTheme();
  const [mostrar, setMostrar] = useState(false);

  const dataAtual = value instanceof Date ? value : new Date(value || Date.now());

  function abrir() {
    if (disabled) return;
    setMostrar(false);
    setTimeout(() => setMostrar(true), 50);
  }

  function onChangeData(event, selectedDate) {
    if (Platform.OS === 'android') {
      setMostrar(false);
    }

    if (event?.type === 'dismissed') {
      setMostrar(false);
      return;
    }

    if (selectedDate) {
      onChange?.(selectedDate);
    }

    if (Platform.OS === 'ios') {
      // no iOS o picker fica embutido; feche se quiser só no OK
      // setMostrar(false);
    }
  }

  return (
    <View style={[styles.wrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={abrir}
        disabled={disabled}
        style={[
          styles.box,
          {
            backgroundColor: colors.neutro,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text style={styles.texto}>
          {dataAtual.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color={colors.principal}
        />
      </Pressable>

      {mostrar && (
        <DateTimePicker
          value={dataAtual}
          mode="date"
          display="default"
          onValueChange={onChangeData}
          onDismiss={() => setMostrar(false)}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
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
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texto: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Roboto-Regular',
  },
});