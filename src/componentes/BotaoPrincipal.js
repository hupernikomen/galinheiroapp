import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function BotaoPrincipal({ titulo, onPress, style }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.botao,
        { backgroundColor: colors.principal || '#B22222' },
        style,
      ]}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});