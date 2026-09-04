import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITENS = [
  {
    titulo: 'Lotes',
    subtitulo: 'Cadastro e gestão dos lotes',
    icone: 'cube-outline',
    rota: 'Lote',
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
];

export default function Menu() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  function irPara(rota) {
    // Ajuste se a rota estiver na Tab ou na Stack raiz
    navigation.navigate(rota);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40 + insets.bottom,
        paddingTop: 8,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.tituloSecao}>Cadastros</Text>

      {ITENS.slice(0, 4).map((item, index) => (
        <Pressable
          key={item.rota}
          onPress={() => irPara(item.rota)}
          style={({ pressed }) => [
            styles.item,
            pressed && { backgroundColor: colors.neutro },
            index < 3 && styles.separador,
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

      <Text style={[styles.tituloSecao, { marginTop: 28 }]}>Ciclo e ajuda</Text>

      {ITENS.slice(4).map((item, index) => (
        <Pressable
          key={item.rota}
          onPress={() => irPara(item.rota)}
          style={({ pressed }) => [
            styles.item,
            pressed && { backgroundColor: colors.neutro },
            index === 0 && styles.separador,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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