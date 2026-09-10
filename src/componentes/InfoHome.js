import { useTheme } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { qtdAtualLote } from '../services/calculosLote';

export default function InfoHome({
  lote = null,
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
  const margemPct = Math.round(Number(margem || 0.6) * 100);

  const qtInicial = Number(lote?.qt) || 0;
  const qtAtual = qtdAtualLote(lote);
  const qtSaida = Number(lote?.qtSaida) || Math.max(0, qtInicial - qtAtual);

  return (
    <View style={styles.container}>
      <View style={styles.lista}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Lote</Text>
          <View style={styles.itemDireita}>
            <Text style={styles.itemValor}>
              {lote ? `${qtAtual} aves` : '—'}
            </Text>
            <Text style={styles.itemSub}>
              {lote
                ? `${lote.raca || '-'} · inicial ${qtInicial}${
                    qtSaida > 0 ? ` · saídas ${qtSaida}` : ''
                  }`
                : 'Selecione um lote'}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Ração</Text>
          <View style={styles.itemDireita}>
            <Text style={styles.itemValor}>
              R$ {Number(totalRacao).toFixed(2)}
            </Text>
            <Text style={styles.itemSub}>
              {Number(custoRacaoPorOvo) > 0
                ? `R$ ${Number(custoRacaoPorOvo).toFixed(2)}/ovo`
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
                ? `R$ ${Number(custoCartelaPorOvo).toFixed(2)}/ovo`
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
            <Text style={styles.itemSub}>Cama, bebedouros e demais</Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Preço sugerido / ovo</Text>
          <View style={styles.itemDireita}>
            <Text style={[styles.itemValor, ]}>
              R$ {Number(precoSugerido || 0).toFixed(2)}
            </Text>
            <Text style={styles.itemSub}>
              Custo R$ {Number(custoProjetado || 0).toFixed(2)}
              {'  ·  '}
              {margemPct}% lucro
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '98%',
    paddingHorizontal: 4,
  },
  lista: {
    paddingHorizontal: 8,
    marginTop: 21,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  itemLabel: {
    fontFamily: 'Roboto-Regular',
    color: '#222',
  },
  itemDireita: {
    alignItems: 'flex-end',
  },
  itemValor: {
    fontFamily: 'Roboto-Medium',
    color: '#222',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 11.5,
    color: '#777',
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
  },
});