import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

const MARGEM = 0.60;

export default function InfoHome({
  totalCriacao = 0,
  totalPostura = 0,
  custoProjetado = 0,
  precoSugerido = 0,
  desempenho = null,
  totalDepreciacao = 0,

}) {
  const total = totalCriacao + totalPostura;
  const percCriacao = total > 0 ? (totalCriacao / total) * 100 : 0;
  const percPostura = total > 0 ? (totalPostura / total) * 100 : 0;

  const { colors } = useTheme()

  return (
    <View style={styles.container}>

      {/* Barra de proporção */}
      <View style={styles.barra}>
        <View style={[styles.fatia, { flex: percCriacao || 0.01, backgroundColor: colors.principal }]} />
        <View style={[styles.fatia, { flex: percPostura || 0.01, backgroundColor: '#f39c12' }]} />
      </View>

      {/* Legenda */}
      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: colors.principal }]} />
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
        <Text style={styles.precoValor}>
          R$ {Number(precoSugerido).toFixed(2)}
        </Text>
        <Text style={styles.precoSub}>
          Custo projetado R$ {Number(custoProjetado).toFixed(3)}
          {' + '}
          {(MARGEM * 100).toFixed(0)}% margem
        </Text>

        {desempenho == null ? (
          <Text style={styles.precoSub}>Ainda em criação — sem meta de ovos</Text>
        ) : (
          <Text style={styles.precoSub}>
            Produção: {(desempenho * 100).toFixed(0)}% do esperado
            {desempenho < 0.8
              ? ' — abaixo da meta'
              : desempenho > 1.1
                ? ' — acima da meta'
                : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  barra: {
    height: 4,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fatia: {
    height: '100%',
  },
  legenda: {
    marginTop: 14,
    gap: 4,
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
    letterSpacing: -.5,
    fontFamily: 'Roboto-Black',
    fontSize: 22,
    marginTop: 4,
  },
  precoSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});