import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function TelaCarregamento() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.principal || '#B22222'} />
      <Text style={styles.texto}>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    marginTop: 16,
    fontFamily: 'Roboto-Light',
    fontSize: 15,
    color: '#666',
  },
});