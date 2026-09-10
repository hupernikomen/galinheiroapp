import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRINCIPAL = '#66796b';
const CREME = '#efdfcc';

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
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 28 }]}>
      <StatusBar barStyle="light-content" backgroundColor={PRINCIPAL} />

      {/* Deco: identidade */}
      <View style={styles.topo}>
        <Text style={styles.selo}>APP DO CRIADOR</Text>
        <Text style={styles.marca}>Meu{'\n'}Galinheiro</Text>
        <View style={styles.linhaMarca} />
        <Text style={styles.heroTexto}>
          Produção, custos e o preço do ovo com clareza — do lote ao bolso.
        </Text>
      </View>

      {/* Base: botão Google */}
      <View style={styles.base}>
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.botaoGoogle, loading && { opacity: 0.75 }]}
        >
          {loading ? (
            <ActivityIndicator color="#3c4043" />
          ) : (
            <View style={styles.botaoInner}>
              <View style={styles.gBadge}>
                <Text style={styles.gAzul}>G</Text>
              </View>
              <Text style={styles.botaoTexto}>Continuar com o Google</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRINCIPAL,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  topo: {
    marginTop: 32,
  },
  selo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 11,
    letterSpacing: 2.2,
    color: CREME,
    opacity: 0.9,
    marginBottom: 16,
  },
  marca: {
    fontFamily: 'Roboto-Black',
    fontSize: 42,
    lineHeight: 44,
    color: '#fff',
    letterSpacing: -1,
  },
  linhaMarca: {
    width: 44,
    height: 3,
    backgroundColor: CREME,
    borderRadius: 2,
    marginTop: 18,
    marginBottom: 16,
  },
  heroTexto: {
    fontFamily: 'Roboto-Light',
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffffcc',
    maxWidth: 300,
  },
  base: {
    width: '100%',
  },
  botaoGoogle: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#dadce0',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  botaoInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  gAzul: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: '#4285F4',
  },
  botaoTexto: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#3c4043',
  },
});