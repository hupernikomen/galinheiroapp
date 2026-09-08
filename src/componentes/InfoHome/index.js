import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoHome({
  totalRacao = 0,
  custoRacaoPorOvo = 0,
  kgRacaoDistribuida = 0,
  totalCartelas = 0,
  custoCartelaPorOvo = 0,
  custoProjetado = 0,
  precoSugerido = 0,
  desempenho = null,
  margem = 0.6,
}) {
  const { colors } = useTheme();
  const margemPct = Math.round(Number(margem) * 100);

  let statusProducao = null;
  let corStatus = '#888';

  if (desempenho != null && !Number.isNaN(Number(desempenho))) {
    const pct = Math.round(Number(desempenho) * 100);
    if (pct < 80) {
      statusProducao = `${pct}% da meta`;
      corStatus = '#c0392b';
    } else if (pct > 110) {
      statusProducao = `${pct}% da meta`;
      corStatus = '#27ae60';
    } else {
      statusProducao = `${pct}% da meta`;
      corStatus = colors.principal;
    }
  }

  return (
    <View style={styles.container}>
      {/* Preço */}
      <View style={styles.hero}>
        <Text style={[styles.preco, { color: colors.principal }]}>
          R$ {Number(precoSugerido || 0).toFixed(2)}<Text style={styles.unidade}>/ ovo</Text>
        </Text>


        <Text style={styles.custoLinha}>
          Custo R$ {Number(custoProjetado || 0).toFixed(2)}
          {'  ·  '}
          {margemPct}% lucro
        </Text>

        {/* {statusProducao ? (
          <View style={[styles.badge, { borderColor: corStatus }]}>
            <Text style={[styles.badgeTexto, { color: corStatus }]}>
              {statusProducao}
            </Text>
          </View>
        ) : (
          <Text style={styles.semColeta}>Sem coleta ainda</Text>
        )} */}
      </View>

      {/* Detalhes */}
      <View style={styles.lista}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Ração Consumida</Text>
          <View style={styles.itemDireita}>
            <Text style={styles.itemValor}>
              R$ {Number(totalRacao).toFixed(2)}
            </Text>
            <Text style={styles.itemSub}>
              {Number(custoRacaoPorOvo) > 0
                ? `R$ ${Number(custoRacaoPorOvo).toFixed(3)}/ovo`
                : Number(kgRacaoDistribuida) > 0
                  ? `${Number(kgRacaoDistribuida).toLocaleString('pt-BR', {
                    maximumFractionDigits: 1,
                  })} kg`
                  : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Embalagens</Text>
          <View style={styles.itemDireita}>
            <Text style={styles.itemValor}>
              R$ {Number(totalCartelas).toFixed(2)}
            </Text>
            <Text style={styles.itemSub}>
              {Number(custoCartelaPorOvo) > 0
                ? `R$ ${Number(custoCartelaPorOvo).toFixed(3)}/ovo`
                : '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },

  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  label: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#999',
  },
  preco: {
    fontFamily: 'Roboto-Black',
    fontSize: 32,
    letterSpacing: -1.5
  },
  unidade: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#777',
    letterSpacing: 0
  },
  custoLinha: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
  },

  semColeta: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#bbb',
  },

  lista: {
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
  },
  itemLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#777',
  },
  itemDireita: {
    alignItems: 'flex-end',
  },
  itemValor: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#222',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 11,
    color: '#777',
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
  },
});