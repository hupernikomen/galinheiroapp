import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoHome({
  totalCriacao = 0,
  totalPostura = 0,
  custoProjetado = 0,
  precoSugerido = 0,
  desempenho = null,
  totalDepreciacao = 0,
  margem = 0.6,
}) {
  const { colors } = useTheme();

  const totalGastos = Number(totalCriacao) + Number(totalPostura);
  const percCriacao =
    totalGastos > 0 ? (Number(totalCriacao) / totalGastos) * 100 : 0;
  const percPostura =
    totalGastos > 0 ? (Number(totalPostura) / totalGastos) * 100 : 0;

  const margemPct = Number(margem) * 100;

  let textoProducao = 'Ainda sem meta de produção para comparar';
  if (desempenho != null && !Number.isNaN(Number(desempenho))) {
    const pct = Number(desempenho) * 100;
    let extra = '';
    if (pct < 80) extra = ' — abaixo da meta';
    else if (pct > 110) extra = ' — acima da meta';
    textoProducao = `Progresso da meta de ovos: ${pct.toFixed(0)}%${extra}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barra}>
        <View
          style={[
            styles.fatia,
            {
              flex: percCriacao > 0 ? percCriacao : totalGastos === 0 ? 1 : 0.001,
              backgroundColor: colors.principal,
            },
          ]}
        />
        <View
          style={[
            styles.fatia,
            {
              flex: percPostura > 0 ? percPostura : totalGastos === 0 ? 1 : 0.001,
              backgroundColor: '#f39c12',
            },
          ]}
        />
      </View>

      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: colors.principal }]} />
          <Text style={styles.legendaTexto}>
            Criação  R$ {Number(totalCriacao).toFixed(2)}
            {totalGastos > 0 ? `  (${percCriacao.toFixed(0)}%)` : ''}
          </Text>
        </View>

        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: '#f39c12' }]} />
          <Text style={styles.legendaTexto}>
            Postura  R$ {Number(totalPostura).toFixed(2)}
            {totalGastos > 0 ? `  (${percPostura.toFixed(0)}%)` : ''}
          </Text>
        </View>

        <View style={styles.legendaItem}>
          <View style={[styles.bolinha, { backgroundColor: '#888' }]} />
          <Text style={styles.legendaTexto}>
            Depreciação  R$ {Number(totalDepreciacao).toFixed(2)}/mês
          </Text>
        </View>
      </View>

      <View style={styles.caixaPreco}>
        <Text style={styles.precoLabel}>Preço sugerido / ovo</Text>
        <Text style={[styles.precoValor, { color: colors.principal }]}>
          R$ {Number(precoSugerido || 0).toFixed(2)}
        </Text>
        <Text style={styles.precoSub}>
          Custo projetado R$ {Number(custoProjetado || 0).toFixed(2)}
          {' + '}
          {margemPct.toFixed(0)}% margem
        </Text>
        <Text style={styles.precoSub}>{textoProducao}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
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
  },
  caixaPreco: {
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  precoLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#777',
  },
  precoValor: {
    letterSpacing: -0.5,
    fontFamily: 'Roboto-Black',
    fontSize: 22,
    marginTop: 4,
  },
  precoSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
});