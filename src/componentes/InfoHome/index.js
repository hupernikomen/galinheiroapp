import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';

export default function InfoHome({
  totalRacao = 0,
  custoRacaoPorOvo = 0,
  kgRacaoDistribuida = 0,
  totalCartelas = 0,
  custoCartelaPorOvo = 0,
  totalOutrosCustos = 0,
  custoProjetado = 0,
  precoSugerido = 0,
  margem = 0.6,
}) {
  const { colors } = useTheme();
  const margemPct = Math.round(Number(margem) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={[styles.preco]}>
          R$ {Number(precoSugerido || 0).toFixed(2)}
          <Text style={styles.unidade}> / ovo</Text>
        </Text>

        <Text style={styles.custoLinha}>
          Custo R$ {Number(custoProjetado || 0).toFixed(2)}
          {'  ·  '}
          {margemPct}% lucro
        </Text>
      </View>

      <View style={styles.lista}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Ração</Text>
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

        <View style={styles.separador} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Outros custos</Text>
          <View style={styles.itemDireita}>
            <Text style={styles.itemValor}>
              R$ {Number(totalOutrosCustos).toFixed(2)}
            </Text>
            <Text style={styles.itemSub}>Cama, criação e demais</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    paddingHorizontal: 4,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  preco: {
    fontFamily: 'Roboto-Black',
    fontSize: 28,
    letterSpacing: -1,
    color:'#333'
  },
  unidade: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    letterSpacing: 0,
  },
  custoLinha: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
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
    fontSize: 12,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
  },
});