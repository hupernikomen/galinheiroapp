import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Login() {
  const { loginComGoogle } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.topo}>
        <View style={styles.logoCircle}>
          <Ionicons name="egg-outline" size={40} color="#66796b" />
        </View>
        <Text style={styles.titulo}>Galinheiro</Text>
        <Text style={styles.sub}>
          Controle de lotes, produção, custos e preço do ovo em um só lugar.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Entrar na sua conta</Text>
        <Text style={styles.cardSub}>
          Use o Google para acessar o app e manter seus dados com segurança.
        </Text>

        <Pressable
          style={[styles.botaoGoogle, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#333" />
          ) : (
            <>
              <View style={styles.googleIconWrap}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.botaoGoogleTexto}>Entrar com Google</Text>
            </>
          )}
        </Pressable>
      </View>

      <Text style={styles.rodape}>
        Ao entrar, você concorda em usar seus dados para cadastro e manutenção da sua conta no app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topo: {
    marginTop: 32,
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e0d8',
  },
  titulo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 32,
    color: '#1a1a1a',
    marginBottom: 10,
  },
  sub: {
    fontFamily: 'Roboto-Light',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    maxWidth: 320,
  },
  card: {
    alignItems:"center",
    justifyContent:'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e4de',
  },
  cardTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    color: '#111',
    marginBottom: 8,
  },
  cardSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginBottom: 22,
    textAlign:"center"
  },
  botaoGoogle: {
    height: 52,
    paddingHorizontal:14,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  botaoGoogleTexto: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#222',
  },
  rodape: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});