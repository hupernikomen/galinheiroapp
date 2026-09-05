import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const ITENS = [
  {
    secao: 'Cadastros',
    lista: [
      {
        titulo: 'Lotes',
        subtitulo: 'Cadastro e gestão dos lotes',
        icone: 'cube-outline',
        rota: 'Lote',
      },
      {
        titulo: 'Coleta de ovos',
        subtitulo: 'Registros de produção',
        icone: 'egg-outline',
        rota: 'Ovos',
      },
      {
        titulo: 'Custos',
        subtitulo: 'Gastos de criação e postura',
        icone: 'shapes-outline',
        rota: 'Custos',
      },
      {
        titulo: 'Investimentos',
        subtitulo: 'Galpão, equipamentos e depreciação',
        icone: 'storefront-outline',
        rota: 'Investimentos',
      },
    ],
  },
  {
    secao: 'Ciclo e ajuda',
    lista: [
      {
        titulo: 'Marcos do ciclo',
        subtitulo: 'Alertas e fases do relógio',
        icone: 'flag-outline',
        rota: 'Marcos',
      },
      {
        titulo: 'Como funcionam os cálculos',
        subtitulo: 'Custo do ovo e preço sugerido',
        icone: 'information-circle-outline',
        rota: 'Info',
      },
    ],
  },
];

export default function Menu() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  console.log(user);
  

  function irPara(rota) {
    // Ajuste o nome se a rota estiver na Tab ou em outra Stack
    navigation.navigate(rota);
  }

  function confirmarSair() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            Alert.alert('Erro', e?.message || 'Não foi possível sair');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: 8,
        paddingBottom: 40 + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Conta */}
      <View style={styles.contaBox}>
        <View style={[styles.avatar, { backgroundColor: colors.neutro }]}>
          <Ionicons name="person" size={28} color={colors.principal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contaNome} numberOfLines={1}>
            {user?.displayName || 'Usuário'}
          </Text>
          <Text style={styles.contaEmail} numberOfLines={1}>
            {user?.email || ''}
          </Text>
        </View>
      </View>

      {ITENS.map((bloco) => (
        <View key={bloco.secao}>
          <Text style={styles.tituloSecao}>{bloco.secao}</Text>

          {bloco.lista.map((item, index) => (
            <Pressable
              key={item.rota}
              onPress={() => irPara(item.rota)}
              style={({ pressed }) => [
                styles.item,
                pressed && { backgroundColor: colors.neutro },
                index < bloco.lista.length - 1 && styles.separador,
              ]}
            >
              <View style={[styles.iconeBox, { backgroundColor: colors.neutro }]}>
                <Ionicons name={item.icone} size={22} color={colors.principal} />
              </View>
              <View style={styles.textos}>
                <Text style={styles.itemTitulo}>{item.titulo}</Text>
                <Text style={styles.itemSub}>{item.subtitulo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </Pressable>
          ))}
        </View>
      ))}

      {/* Sair */}
      <Text style={[styles.tituloSecao, { marginTop: 28 }]}>Sessão</Text>
      <Pressable
        onPress={confirmarSair}
        style={({ pressed }) => [
          styles.item,
          pressed && { backgroundColor: colors.neutro },
        ]}
      >
        <View style={[styles.iconeBox, { backgroundColor: colors.neutro }]}>
          <Ionicons name="log-out-outline" size={22} color="#c0392b" />
        </View>
        <View style={styles.textos}>
          <Text style={[styles.itemTitulo, { color: '#c0392b' }]}>Sair da conta</Text>
          <Text style={styles.itemSub}>Encerrar sessão neste aparelho</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 21,
    paddingVertical: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contaNome: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#000',
  },
  contaEmail: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  tituloSecao: {
    fontFamily: 'Roboto-Medium',
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 21,
    marginBottom: 8,
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 21,
    paddingVertical: 14,
  },
  separador: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#22222218',
  },
  iconeBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textos: {
    flex: 1,
  },
  itemTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#000',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});