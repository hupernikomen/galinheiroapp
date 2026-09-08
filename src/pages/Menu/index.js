import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITENS = [
  {
    secao: 'Cadastros',
    lista: [
      {
        titulo: 'Lotes',
        subtitulo: 'Cadastro e gestão dos lotes',
        rota: 'Lote',
      },
      {
        titulo: 'Custos',
        subtitulo: 'Outros gastos do lote',
        rota: 'Custos',
      },
      {
        titulo: 'Investimentos',
        subtitulo: 'Galpão, equipamentos e depreciação',
        rota: 'Investimentos',
      },
    ],
  },
  {
    secao: 'Ração e embalagem',
    lista: [
      {
        titulo: 'Estoque de ração',
        subtitulo: 'Compras e saldo em kg',
        rota: 'EstoqueRacao',
      },
      {
        titulo: 'Cartelas',
        subtitulo: 'Compras de embalagem',
        rota: 'Cartelas',
      },
    ],
  },
  {
    secao: 'Ciclo e ajuda',
    lista: [
      {
        titulo: 'Marcos do ciclo',
        subtitulo: 'Alertas e fases do relógio',
        rota: 'Marcos',
      },
      {
        titulo: 'Como funciona',
        subtitulo: 'Custo do ovo e preço sugerido',
        rota: 'Info',
      },
    ],
  },
];

export default function Menu() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  function irPara(rota) {
    navigation.navigate(rota);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: 40 + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      {ITENS.map((bloco) => (
        <View key={bloco.secao} style={styles.bloco}>
          <Text style={styles.tituloSecao}>{bloco.secao}</Text>

          <View style={styles.listaCard}>
            {bloco.lista.map((item, index) => (
              <Pressable
                key={item.rota}
                onPress={() => irPara(item.rota)}
                style={({ pressed }) => [
                  styles.item,
                  pressed && { backgroundColor: '#f7f7f7' },
                  index < bloco.lista.length - 1 && styles.separador,
                ]}
              >
                <View style={styles.textos}>
                  <Text style={styles.itemTitulo}>{item.titulo}</Text>
                  <Text style={styles.itemSub}>{item.subtitulo}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bloco: {
    marginBottom: 8,
  },
  tituloSecao: {
    fontFamily: 'Roboto-Medium',
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginVertical: 16,
    marginLeft: 28,
  },
  listaCard: {
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  separador: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  textos: {
    flex: 1,
  },
  itemTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#111',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});