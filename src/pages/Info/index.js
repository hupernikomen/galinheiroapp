import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';

const SECOES = [
  {
    titulo: '1. Custos de Criação',
    texto:
      'São os gastos antes das galinhas começarem a botar (ração inicial, pintainhas, vacinas, etc.).\n\nEsses valores não somem: são divididos por todos os ovos que o lote deve produzir na vida. Assim, o custo da criação entra no preço do ovo de forma diluída, e não pesa só nos primeiros ovos.',
  },
  {
    titulo: '2. Custos de Postura',
    texto:
      'São os gastos depois que a produção de ovos começa (ração de postura, medicamentos, embalagens, etc.).\n\nTambém entram no custo de cada ovo, junto com a criação, usando a produção total estimada do lote.',
  },
  {
    titulo: '3. Investimentos e depreciação',
    texto:
      'Itens caros e duráveis (galpão, equipamentos) não devem entrar de uma vez no preço do ovo.\n\nVocê informa o valor total e quantos anos deve durar. O app calcula uma parcela mensal e divide entre os lotes ativos.\n\nQuando um lote é finalizado, ele deixa de receber essa parcela; os demais passam a dividir o valor.',
  },
  {
    titulo: '4. Produção total estimada',
    texto:
      'No cadastro do lote você informa quantas galinhas tem hoje e quantos ovos cada uma deve produzir na vida.\n\nProdução estimada = galinhas × ovos por galinha\n\nÉ essa quantidade que o app usa para diluir os custos e montar um preço estável.',
  },
  {
    titulo: '5. Custo projetado do ovo',
    texto:
      'É o valor estimado para produzir 1 ovo, considerando a vida toda do lote:\n\nCusto do ovo = (Criação + Postura + depreciação) ÷ produção total estimada\n\nA ideia é o preço não oscilar demais a cada gasto na criação.',
  },
  {
    titulo: '6. Preço sugerido',
    texto:
      'É o custo do ovo com a margem de lucro (ex.: 60%).\n\nPreço sugerido = Custo do ovo × 1,60\n\nServe como referência mínima de venda. Você pode cobrar mais; o app só mostra um piso para não vender abaixo do custo projetado.',
  },
  {
    titulo: '7. Desempenho da produção',
    texto:
      'Na fase de postura, o app compara os ovos já coletados com os ovos esperados até hoje (com base na estimativa e na idade do lote).\n\n• Perto de 100% → produção dentro do planejado\n• Bem abaixo → pode faltar ovo no fim e o custo real sobe\n• Acima → lote produzindo melhor que o previsto\n\nNa criação ainda não há meta de ovos, então o desempenho não se aplica.',
  },
  {
    titulo: '8. Barra Criação / Postura',
    texto:
      'A barra mostra só a proporção dos gastos já lançados: criação e postura.\n\nIsso não é o preço do ovo; é o quanto de dinheiro já foi gasto em cada fase.',
  },
];

export default function Info() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >


      {/* Seções */}
      {SECOES.map((item, index) => (
        <View
          key={index}
          style={[styles.card, { backgroundColor: colors.neutro }]}
        >
          <View style={styles.tituloRow}>
            <View
              style={[
                styles.marcador,
                { backgroundColor: colors.principal || '#B22222' },
              ]}
            />
            <Text style={styles.titulo}>{item.titulo}</Text>
          </View>
          <Text style={styles.texto}>{item.texto}</Text>
        </View>
      ))}

      {/* Resumo final */}
      <View
        style={[
          styles.resumo,
          { borderColor: colors.principal || '#B22222' },
        ]}
      >
        <Text style={styles.resumoTitulo}>Em uma frase</Text>
        <Text style={styles.resumoTexto}>
          Custos e investimentos são diluídos na produção estimada da vida da
          galinha. O app mostra um custo por ovo e um preço sugerido estáveis, e
          avisa se a coleta real está acompanhando o plano.
        </Text>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  hero: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
  },
  heroTitulo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#fff',
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 14,
    color: '#ffe5e5',
    lineHeight: 20,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
  },
  intro: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  tituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  marcador: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  titulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  texto: {
    fontFamily: 'Roboto-Light',
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },
  resumo: {
    marginTop: 8,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#fff',
  },
  resumoTitulo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  resumoTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },
});