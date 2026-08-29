import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';
import {
  MARGEM_DE_LUCRO,
  SEMANA_INICIO_POSTURA,
  SEMANAS_POSTURA,
} from '../constants/galinheiro';

/** Semanas desde a chegada do lote */
export function calcularSemanasLote(lote) {
  if (!lote?.chegada) return 0;

  let dataChegada;
  if (lote.chegada?.toDate) {
    dataChegada = lote.chegada.toDate();
  } else {
    let ts = Number(lote.chegada);
    if (ts > 0 && ts < 10000000000) ts *= 1000;
    dataChegada = new Date(ts);
  }

  const hoje = new Date();
  dataChegada.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  const dias = Math.floor((hoje - dataChegada) / (1000 * 60 * 60 * 24));
  return dias <= 0 ? 1 : Math.ceil(dias / 7);
}

/** Busca ovos do lote: total + mapa por dia */
export async function buscarOvos(loteId) {
  const snap = await getDocs(
    query(collection(db, 'coletaOvos'), where('loteId', '==', loteId))
  );

  let totalOvosProduzidos = 0;
  const porDia = {};

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const qtd = Number(data.qt) || 0;
    totalOvosProduzidos += qtd;

    let dia;
    if (data.data?.toDate) {
      dia = data.data.toDate().toISOString().slice(0, 10);
    } else if (data.data) {
      dia = new Date(Number(data.data)).toISOString().slice(0, 10);
    } else {
      return;
    }

    porDia[dia] = (porDia[dia] || 0) + qtd;
  });

  return { totalOvosProduzidos, porDia };
}

/** Média de produção diária (%) */
export function mediaProducaoDiaria(porDia, qtdGalinhas) {
  if (!qtdGalinhas || !porDia || Object.keys(porDia).length === 0) return 0;

  const producoes = Object.values(porDia).map(
    (total) => (total / qtdGalinhas) * 100
  );
  const media = producoes.reduce((a, b) => a + b, 0) / producoes.length;
  return Number(media.toFixed(1));
}

/** Totais de criação e postura */
export async function buscarCustos(loteId) {
  const snap = await getDocs(
    query(collection(db, 'custos'), where('loteId', '==', loteId))
  );

  let totalCriacao = 0;
  let totalPostura = 0;

  snap.forEach((docSnap) => {
    const c = docSnap.data();
    const valor = Number(c.valor) || 0;
    if (c.idade === 'Criacao') totalCriacao += valor;
    if (c.idade === 'Postura') totalPostura += valor;
  });

  return { totalCriacao, totalPostura };
}

/** Parcela mensal de depreciação rateada nos lotes ativos */
export async function buscarDepreciacao() {
  let parcelaDepreciacaoMes = 0;

  const invSnap = await getDocs(collection(db, 'investimentos'));
  invSnap.forEach((docSnap) => {
    const inv = docSnap.data();
    if (inv.ativo === false) return;

    const valor = Number(inv.valorTotal) || 0;
    const anos = Number(inv.vidaUtilAnos) || 0;
    if (anos > 0) {
      parcelaDepreciacaoMes += valor / anos / 12;
    }
  });

  const lotesSnap = await getDocs(collection(db, 'lotes'));
  const lotesAtivos = lotesSnap.docs.filter(
    (d) => d.data().status !== 'Finalizado'
  );
  const qtdAtivos = lotesAtivos.length || 1;

  return {
    parcelaDepreciacaoMes,
    depreciacaoNoLote: parcelaDepreciacaoMes / qtdAtivos,
    qtdAtivos,
  };
}

/** Custo projetado (vida inteira) + preço sugerido */
export function calcularCustoProjetado({
  totalCriacao,
  totalPostura,
  depreciacaoNoLote,
  producaoTotalEstimada,
  margem = MARGEM_DE_LUCRO,
}) {
  const gastosTotais =
    (totalCriacao || 0) + (totalPostura || 0) + (depreciacaoNoLote || 0);

  const custoProjetado =
    producaoTotalEstimada > 0 ? gastosTotais / producaoTotalEstimada : 0;

  const precoSugerido = custoProjetado * (1 + margem);

  return {
    gastosTotais,
    custoProjetado,
    precoSugerido,
    custoDepreciacao:
      producaoTotalEstimada > 0
        ? (depreciacaoNoLote || 0) / producaoTotalEstimada
        : 0,
  };
}

/** Desempenho: coletados vs esperados até hoje */
export function calcularDesempenho({
  semanas,
  producaoTotalEstimada,
  totalOvosProduzidos,
}) {
  const semanasDePostura = Math.max(0, semanas - SEMANA_INICIO_POSTURA);
  const fracaoPostura = Math.min(semanasDePostura / SEMANAS_POSTURA, 1);

  const ovosEsperadosAteHoje =
    semanasDePostura > 0 ? producaoTotalEstimada * fracaoPostura : 0;

  const desempenho =
    ovosEsperadosAteHoje > 0
      ? totalOvosProduzidos / ovosEsperadosAteHoje
      : null;

  return {
    ovosEsperadosAteHoje,
    desempenho,
  };
}

/**
 * Orquestra tudo para um lote
 * Retorna o objeto completo de custoOvo + producao + dadosRelogio
 */
export async function calcularTudoDoLote(lote) {
  if (!lote?.id) {
    return {
      producao: 0,
      dadosRelogio: { totalOvosProduzidos: 0, producaoTotalEstimada: 0 },
      custoOvo: null,
    };
  }

  const qtdGalinhas = Number(lote.qtAtual) || 0;
  const producaoPorGalinha = Number(lote.prodEstimada) || 0;
  const producaoTotalEstimada = qtdGalinhas * producaoPorGalinha;

  const { totalOvosProduzidos, porDia } = await buscarOvos(lote.id);
  const producao = mediaProducaoDiaria(porDia, qtdGalinhas);

  const { totalCriacao, totalPostura } = await buscarCustos(lote.id);
  const { depreciacaoNoLote } = await buscarDepreciacao();

  const {
    gastosTotais,
    custoProjetado,
    precoSugerido,
    custoDepreciacao,
  } = calcularCustoProjetado({
    totalCriacao,
    totalPostura,
    depreciacaoNoLote,
    producaoTotalEstimada,
  });

  const semanas = calcularSemanasLote(lote);
  const { ovosEsperadosAteHoje, desempenho } = calcularDesempenho({
    semanas,
    producaoTotalEstimada,
    totalOvosProduzidos,
  });

  return {
    producao,
    dadosRelogio: {
      totalOvosProduzidos,
      producaoTotalEstimada,
    },
    custoOvo: {
      totalCriacao: Number(totalCriacao.toFixed(2)),
      totalPostura: Number(totalPostura.toFixed(2)),
      totalDepreciacao: Number(depreciacaoNoLote.toFixed(2)),
      gastosTotais: Number(gastosTotais.toFixed(2)),
      producaoTotalEstimada,
      totalOvosProduzidos,
      ovosEsperadosAteHoje: Number(ovosEsperadosAteHoje.toFixed(0)),
      custoProjetado: Number(custoProjetado.toFixed(4)),
      precoSugerido: Number(precoSugerido.toFixed(3)),
      desempenho:
        desempenho === null ? null : Number(desempenho.toFixed(2)),
      custoTotal: Number(custoProjetado.toFixed(4)),
      custoDepreciacao: Number(custoDepreciacao.toFixed(4)),
    },
  };
}