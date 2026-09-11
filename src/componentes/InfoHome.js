import { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { AppContext } from '../contexts/AppContext';
import { qtdAtualLote } from '../services/calculosLote';

export default function InfoHome() {
  const { colors } = useTheme();
  const { lote, custoOvo } = useContext(AppContext);

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

  const totalOvosProduzidos =
    Number(custoOvo?.totalOvosProduzidos) ||
    (desempenho != null && ovosEsperadosAteHoje > 0
      ? Math.round(Number(desempenho) * ovosEsperadosAteHoje)
      : 0);

  const custoProjetado = Number(custoOvo?.custoProjetado) || 0;
  const precoSugerido = Number(custoOvo?.precoSugerido) || 0;
  const margemPct = Math.round(Number(custoOvo?.margem ?? 0.6) * 100);

  const itens = useMemo(() => {
    return [
      {
        id: 'lote',
        label: 'Lote',
        valor: lote ? `${qtAtual}` : '—',
        sub: lote
          ? `${lote.raca || '-'} · inicial ${qtInicial}${
              qtSaida > 0 ? ` · saídas ${qtSaida}` : ''
            }`
          : 'Selecione um lote',
      },
      {
        id: 'racao',
        label: 'Ração',
        valor: `R$ ${totalRacao.toFixed(2)}`,
        sub: [
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
        id: 'criacao',
        label: 'Criação',
        valor: `R$ ${totalCriacao.toFixed(2)}`,
        sub: [
          custoFormacaoPorGalinha > 0
            ? `R$ ${custoFormacaoPorGalinha.toFixed(2)}/ave`
            : null,
          custoCriacaoPorOvo > 0
            ? `R$ ${custoCriacaoPorOvo.toFixed(2)}/ovo`
            : null,
        ]
          .filter(Boolean)
          .join('  ·  ') || 'Até o início da postura',
      },
      {
        id: 'postura',
        label: 'Postura',
        valor: `R$ ${totalPostura.toFixed(2)}`,
        sub: 'Demais custos na postura',
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
        id: 'ovos',
        label: 'Ovos produzidos',
        valor:
          totalOvosProduzidos > 0
            ? totalOvosProduzidos.toLocaleString('pt-BR')
            : '—',
        sub:
          ovosEsperadosAteHoje > 0
            ? `Esperado: ${ovosEsperadosAteHoje.toLocaleString('pt-BR')}${
                semanasPostura > 0 ? `  ·  ${semanasPostura} sem.` : ''
              }`
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
      {
        id: 'custo',
        label: 'Custo / ovo',
        valor: `R$ ${custoProjetado.toFixed(2)}`,
        sub: 'Soma de todos os custos',
      },
      {
        id: 'preco',
        label: 'Preço sugerido',
        valor: `R$ ${precoSugerido.toFixed(2)}`,
        sub: `Custo R$ ${custoProjetado.toFixed(2)}  ·  ${margemPct}% lucro`,
        destaque: true,
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
    semanasPostura,
    desempenho,
    custoProjetado,
    precoSugerido,
    margemPct,
  ]);

  function renderItem({ item, index }) {
    const isLast = index === itens.length - 1;

    return (
      <View
        style={[
          styles.card,
          item.destaque && {
            backgroundColor: `${colors.principal}12`,
            borderColor: `${colors.principal}30`,
          },
        ]}
      >
        <View style={styles.itemTopo}>
          <Text
            style={[
              styles.itemLabel,
              item.destaque && { color: colors.principal },
            ]}
          >
            {item.label}
          </Text>
          <Text
            style={[
              styles.itemValor,
              item.destaque && {
                color: colors.principal,
                fontFamily: 'Roboto-Bold',
                fontSize: 17,
              },
            ]}
          >
            {item.valor}
          </Text>
        </View>
        <Text style={styles.itemSub}>{item.sub}</Text>
        {!isLast && !item.destaque ? null : null}
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
    height: 280,
    position: 'relative',
  },
  listaScroll: {
    flex: 1,
  },
  lista: {
    paddingHorizontal: 10,
    paddingTop: 28,
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