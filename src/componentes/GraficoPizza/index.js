import { View, Text, StyleSheet } from 'react-native';

const MARGEM = 0.60;

export default function GraficoPizzaCustos({
  totalCriacao = 0,
  totalPostura = 0,
  custoTotal = 0,
}) {
  const total = totalCriacao + totalPostura;
  const percCriacao = total > 0 ? (totalCriacao / total) * 100 : 0;
  const percPostura = total > 0 ? (totalPostura / total) * 100 : 0;
  const precoSugerido = Number(custoTotal) * (1 + MARGEM);

  return (
    <View style={styles.container}>

      {/* Barra de proporção */}
      <View style={styles.barra}>
        <View style={[styles.fatia, { flex: percCriacao || 0.01, backgroundColor: 'red' }]} />
        <View style={[styles.fatia, { flex: percPostura || 0.01, backgroundColor: '#f39c12' }]} />
      </View>

      {/* Legenda */}
      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: 'red' }]} />
          <Text style={styles.legendaTexto}>
            Criação  R$ {Number(totalCriacao).toFixed(2)}  ({percCriacao.toFixed(0)}%)
          </Text>
        </View>

        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: '#f39c12' }]} />
          <Text style={styles.legendaTexto}>
            Postura  R$ {Number(totalPostura).toFixed(2)}  ({percPostura.toFixed(0)}%)
          </Text>
        </View>
      </View>

      {/* Preço sugerido */}
      <View style={styles.caixaPreco}>
        <Text style={styles.precoLabel}>Preço sugerido / ovo</Text>
        <Text style={styles.precoValor}>R$ {precoSugerido.toFixed(2)}</Text>
        <Text style={styles.precoSub}>
          Custo R$ {Number(custoTotal).toFixed(2)} + {(MARGEM * 100).toFixed(0)}% margem
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 16,
  },
  barra: {
    height: 4,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  fatia: {
    height: '100%',
  },
  legenda: {
    marginTop: 14,
    gap: 8,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bolinha: {
    width: 6,
    height: 6,
    borderRadius: 6,
  },
  legendaTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#333',
  },
  caixaPreco: {
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  precoLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#666',
  },
  precoValor: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: 'red',
    marginTop: 4,
  },
  precoSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});