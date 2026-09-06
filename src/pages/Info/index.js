import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Info() {
  const { colors } = useTheme();
  const principal = colors.principal || '#66796b';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
     

      <View style={styles.item}>
        <Ionicons name="cube-outline" size={22} color={principal} />
        <View style={styles.itemTexto}>
          <Text style={styles.itemTitulo}>O lote</Text>
          <Text style={styles.itemDesc}>
            Quantas galinhas temos e quantos ovos cada uma deve botar na vida.
            Isso monta a meta de produção do lote.
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Ionicons name="wallet-outline" size={22} color={principal} />
        <View style={styles.itemTexto}>
          <Text style={styles.itemTitulo}>Os custos</Text>
          <Text style={styles.itemDesc}>
            Ração, remédios e outros gastos do dia a dia, na criação ou na
            postura.
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Ionicons name="home-outline" size={22} color={principal} />
        <View style={styles.itemTexto}>
          <Text style={styles.itemTitulo}>Os investimentos</Text>
          <Text style={styles.itemDesc}>
            Galpão e equipamentos. Como duram vários anos, o valor é dividido no
            tempo e não pesa tudo de uma vez no ovo.
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Ionicons name="egg-outline" size={22} color={principal} />
        <View style={styles.itemTexto}>
          <Text style={styles.itemTitulo}>A coleta de ovos</Text>
          <Text style={styles.itemDesc}>
            O que recolhemos cada dia. Serve para acompanhar se a produção está
            dentro do planejado.
          </Text>
        </View>
      </View>

      <Text style={styles.titulo}>Como chega no preço do ovo</Text>
      <Text style={styles.texto}>
        O app soma o que gastamos com o lote e uma parte dos investimentos.
        Depois divide pela quantidade de ovos que o lote deve produzir no total.
      </Text>
      <Text style={[styles.texto, { marginTop: 10 }]}>
        Assim o gasto da criação não fica só nos primeiros ovos. Ele é rateado
        por toda a vida produtiva das aves. Em cima desse custo, entra a margem
        de lucro e aparece o preço sugerido de venda.
      </Text>

      <Text style={styles.titulo}>O que vemos na tela inicial</Text>
      <Text style={styles.texto}>
        Na Home acompanhamos o lote escolhido: o custo de um ovo, o preço
        sugerido para vender e se a coleta está perto da meta. Quanto mais em
        dia estiverem os lançamentos, mais esses números batem com a realidade
        do nosso galinheiro.
      </Text>

      <View style={[styles.caixa, { backgroundColor: colors.neutro }]}>
        <Text style={styles.caixaTexto}>
          Não precisa entender de conta complicada. Basta cadastrar direito o
          lote, os gastos e as coletas. O app faz as contas e mostra o resultado.
        </Text>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topo: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  topoTitulo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  topoTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
  },
  titulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 17,
    color: '#111',
    marginBottom: 10,
    marginTop: 16,
  },
  texto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
    gap: 12,
  },
  itemTexto: {
    flex: 1,
  },
  itemTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#111',
    marginBottom: 4,
  },
  itemDesc: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  caixa: {
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
  },
  caixaTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});