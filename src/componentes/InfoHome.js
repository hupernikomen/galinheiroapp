import { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useTheme } from '@react-navigation/native';
import { AppContext } from '../contexts/AppContext';
import { qtdAtualLote } from '../services/calculosLote';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function InfoHome() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { lote, setLote, listaLotes, custoOvo } = useContext(AppContext);

  const qtInicial = Number(lote?.qt) || 0;
  const qtAtual =
    Number(custoOvo?.qtdAtual) || qtdAtualLote(lote) || 0;
  const qtSaida = Number(lote?.qtSaida) || Math.max(0, qtInicial - qtAtual);

  const totalRacao = Number(custoOvo?.totalRacao) || 0;
  const custoRacaoPorOvo = Number(custoOvo?.custoRacaoPorOvo) || 0;
  const kgRacaoDistribuida = Number(custoOvo?.kgRacaoDistribuida) || 0;

  const totalCartelas = Number(custoOvo?.totalCartelas) || 0;
  const custoCartelaPorOvo = Number(custoOvo?.custoCartelaPorOvo) || 0;

  const totalCama = Number(custoOvo?.totalCama) || 0;
  const custoCamaPorOvo = Number(custoOvo?.custoCamaPorOvo) || 0;

  const totalCriacao = Number(custoOvo?.totalCriacao) || 0;
  const custoCriacaoPorOvo = Number(custoOvo?.custoCriacaoPorOvo) || 0;
  const custoFormacaoPorGalinha =
    Number(custoOvo?.custoFormacaoPorGalinha) || 0;

  const totalPostura = Number(custoOvo?.totalPostura) || 0;

  const totalDepreciacao = Number(custoOvo?.totalDepreciacao) || 0;
  const custoDepreciacao = Number(custoOvo?.custoDepreciacao) || 0;

  const ovosEsperadosAteHoje = Number(custoOvo?.ovosEsperadosAteHoje) || 0;
  const desempenho = custoOvo?.desempenho ?? null;
  const semanasPostura = Number(custoOvo?.semanasPostura) || 0;

  const totalOvosProduzidos = Number(custoOvo?.totalOvosProduzidos) || 0;
  const producaoTotalEstimada =
    Number(custoOvo?.producaoTotalEstimada) || 0;

  const custoProjetado = Number(custoOvo?.custoProjetado) || 0;
  const precoSugerido = Number(custoOvo?.precoSugerido) || 0;
  const margemPct = Math.round(Number(custoOvo?.margem ?? 0.6) * 100);

  const itens = useMemo(() => {
    return [
      { id: 'picker', tipo: 'picker' },
      {
        id: 'lote',
        label: 'Lote',
        valor: lote ? `${qtAtual}` : '—',
        sub: lote
          ? `${lote.raca || '-'} · inicial ${qtInicial}${qtSaida > 0 ? ` · saídas ${qtSaida}` : ''
          }`
          : 'Selecione um lote',
      },
      {
        id: 'racao',
        label: 'Ração',
        valor: `R$ ${totalRacao.toFixed(2)}`,
        sub:
          [
            kgRacaoDistribuida > 0
              ? `${kgRacaoDistribuida.toLocaleString('pt-BR', {
                maximumFractionDigits: 1,
              })} kg`
              : null,
            custoRacaoPorOvo > 0
              ? `R$ ${custoRacaoPorOvo.toFixed(2)}/ovo`
              : null,
          ]
            .filter(Boolean)
            .join('  ·  ') || 'Sem lançamentos',
      },
      {
        id: 'embalagens',
        label: 'Embalagens',
        valor: `R$ ${totalCartelas.toFixed(2)}`,
        sub:
          custoCartelaPorOvo > 0
            ? `R$ ${custoCartelaPorOvo.toFixed(2)}/ovo`
            : 'Cartelas',
      },
      {
        id: 'cama',
        label: 'Cama',
        valor: `R$ ${totalCama.toFixed(2)}`,
        sub:
          custoCamaPorOvo > 0
            ? `R$ ${custoCamaPorOvo.toFixed(2)}/ovo`
            : 'Cama do galinheiro',
      },
      {
        id: 'depreciacao',
        label: 'Depreciação',
        valor: `R$ ${totalDepreciacao.toFixed(2)}/mês`,
        sub:
          custoDepreciacao > 0
            ? `R$ ${custoDepreciacao.toFixed(2)}/ovo`
            : 'Investimentos diluídos',
      },
      {
        id: 'preco',
        label: 'Preço sugerido',
        valor: `R$ ${precoSugerido.toFixed(2)}`,
        sub: `Custo R$ ${custoProjetado.toFixed(2)}  ·  ${margemPct}% lucro`,
        destaque: true,
      },
      {
        id: 'ovos',
        label: 'Ovos produzidos',
        valor:
          totalOvosProduzidos > 0
            ? totalOvosProduzidos.toLocaleString('pt-BR')
            : '—',
        sub:
          ovosEsperadosAteHoje > 0
            ? `Esperado: ${ovosEsperadosAteHoje.toLocaleString('pt-BR')}${semanasPostura > 0 ? `  ·  ${semanasPostura} sem.` : ''
            }`
            : producaoTotalEstimada > 0
              ? `Meta vida: ${producaoTotalEstimada.toLocaleString('pt-BR')}`
              : 'Coletas registradas',
      },
      {
        id: 'desempenho',
        label: 'Desempenho',
        valor:
          desempenho == null
            ? '—'
            : `${Math.round(Number(desempenho) * 100)}%`,
        sub:
          desempenho == null
            ? 'Ainda sem base de meta'
            : desempenho < 0.8
              ? 'Abaixo do esperado'
              : desempenho > 1.1
                ? 'Acima do esperado'
                : 'Dentro da meta',
      },
    ];
  }, [
    lote,
    qtAtual,
    qtInicial,
    qtSaida,
    totalRacao,
    custoRacaoPorOvo,
    kgRacaoDistribuida,
    totalCartelas,
    custoCartelaPorOvo,
    totalCama,
    custoCamaPorOvo,
    totalCriacao,
    custoCriacaoPorOvo,
    custoFormacaoPorGalinha,
    totalPostura,
    totalDepreciacao,
    custoDepreciacao,
    totalOvosProduzidos,
    ovosEsperadosAteHoje,
    producaoTotalEstimada,
    semanasPostura,
    desempenho,
    custoProjetado,
    precoSugerido,
    margemPct,
  ]);

  function onChangeLote(itemValue) {
    if (!itemValue) {
      setLote(null);
      return;
    }
    const loteSelecionado = (listaLotes || []).find((l) => l.id === itemValue);
    if (loteSelecionado) setLote(loteSelecionado);
  }

  function renderItem({ item }) {
    if (item.tipo === 'picker') {
      return (
        <View style={[styles.card, { paddingVertical: 0, paddingRight:3, marginBottom: 14, borderColor:colors.neutro }]}>
          <View style={styles.pickerWrap}>
            <Picker
              style={styles.picker}
              selectedValue={lote?.id || ''}
              onValueChange={onChangeLote}
            >
              <Picker.Item label="Selecione um lote" value="" style={{
                fontFamily: 'Roboto-Regular',
                fontSize: 15,
              }} />
              {(listaLotes || []).map((l) => (
                <Picker.Item
                  style={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 14,
                  }}
                  key={l.id}
                  label={l?.nome || 'Lote'}
                  value={l.id}
                />
              ))}
            </Picker>

            <Pressable
              onPress={() => navigation.navigate('NovoLote')}
              style={[styles.botaoAdd,{backgroundColor: colors.neutro}]}
            >
              <Ionicons name="add" size={22} />
            </Pressable>
          </View>
        </View>
      );
    }

    if (!lote) {
      return null;
    }

    return (
      <View
        style={[
          styles.card,
          { marginBottom: item.id === 'preco' ? 14 : 0 },
        ]}
      >
        <View style={styles.itemTopo}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Text
            style={[
              styles.itemValor,
              item.destaque && {
                backgroundColor: colors.destaque || colors.principal,
                color: '#fff',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
                overflow: 'hidden',
              },
            ]}
          >
            {item.valor}
          </Text>
        </View>
        <Text style={styles.itemSub}>{item.sub}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.fadeTop}>
        <View style={[styles.fadeFaixa, { opacity: 1 }]} />
        <View style={[styles.fadeFaixa, { opacity: 0.85 }]} />
        <View style={[styles.fadeFaixa, { opacity: 0.55 }]} />
        <View style={[styles.fadeFaixa, { opacity: 0.25 }]} />
      </View>

      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        style={styles.listaScroll}
      />

      <View pointerEvents="none" style={styles.fadeBottom}>
        <View style={[styles.fadeFaixa, { opacity: 0.2 }]} />
        <View style={[styles.fadeFaixa, { opacity: 0.45 }]} />
        <View style={[styles.fadeFaixa, { opacity: 0.7 }]} />
        <View style={[styles.fadeFaixa, { opacity: 1 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  listaScroll: {
    flex: 1,
  },
  lista: {
    paddingHorizontal: 10,
    paddingTop: 21,
    paddingBottom: 36,
    gap: 8,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ececec',
    overflow:"hidden"
  },
  itemTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemLabel: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  itemValor: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#1a1a1a',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    color: '#888',
  },
  pickerWrap: {
    marginHorizontal: -8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#444',
    flex: 1,
    height: 55,
  },
  botaoAdd: {
    width: 65,
    height:55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fadeTop: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0,
    top: 0,
    height: 28,
  },
  fadeBottom: {
    position: 'absolute',
    zIndex: 2,
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    justifyContent: 'flex-end',
  },
  fadeFaixa: {
    flex: 1,
    backgroundColor: '#fff',
  },
});