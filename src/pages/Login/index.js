import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { loginComGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await loginComGoogle();
    } catch (e) {
      console.log('Erro login:', e);
      Alert.alert('Erro', e?.message || 'Não foi possível entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Galinheiro</Text>
      <Text style={styles.sub}>Entre com sua conta Google para continuar</Text>

      <Pressable style={styles.botao} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Entrar com Google</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titulo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 8,
  },
  sub: {
    fontFamily: 'Roboto-Light',
    fontSize: 15,
    color: '#666',
    marginBottom: 40,
  },
  botao: {
    height: 52,
    borderRadius: 22,
    backgroundColor: '#66796b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});