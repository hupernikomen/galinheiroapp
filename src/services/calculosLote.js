import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

const MARGEM_DE_LUCRO = 0.6;
const SEMANAS_CICLO_POSTURA = 72;

const PRODUCAO_PCT_POR_SEMANA = [
  0,
  0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.5, 3.8,
  3.9, 3.9, 3.8, 3.7, 3.5, 3.3, 3.1, 2.9, 2.7, 2.5,
  2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.5,
  1.4, 1.4, 1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0,
  0.95, 0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.75, 0.75, 0.7,
  0.7, 0.65, 0.65, 0.6, 0.6, 0.55, 0.55, 0.5, 0.5, 0.45,
  0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.25, 0.25, 0.2,
  0.2, 0.15,
];

/**
 * Quantidade atual do lote:
 * qt (inicial) - qtSaida (morte + venda)
 * Compatível com lotes antigos que ainda têm qtAtual.
 */
export function qtdAtualLote(lote) {
  const qt = Number(lote?.qt) || 0;

  if (lote?.qtSaida != null && lote.qtSaida !== '') {
    return Math.max(0, qt - (Number(lote.qtSaida) || 0));
  }

  if (lote?.qtAtual != null && lote.qtAtual !== '') {
    return Math.max(0, Number(lote.qtAtual) || 0);
  }

  return qt;
}

/**
 * Galinhas usadas na formação (congeladas no início da postura).
 * Se ainda não gravou qtInicioPostura, usa a quantidade atual.
 */
export function qtdFormacaoLote(lote) {
  if (lote?.qtInicioPostura != null && lote.qtInicioPostura !== '') {
    return Math.max(0, Number(lote.qtInicioPostura) || 0);
  }
  return qtdAtualLote(lote);
}

function toDataDia(valor) {
  if (!valor && valor !== 0) return null;
  let d;
  if (valor?.toDate) d = valor.toDate();
  else {
    let ts = Number(valor);
    if (ts > 0 && ts < 10000000000) ts *= 1000;
    d = new Date(ts);
  }
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calcularSemanasLote(lote) {
  if (!lote?.chegada) return 0;
  const dataChegada = toDataDia(lote.chegada);
  if (!dataChegada) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoje - dataChegada) / (1000 * 60 * 60 * 24));
  return dias <= 0 ? 1 : Math.ceil(dias / 7);
}

export function calcularSemanasPostura(lote) {
  if (!lote?.inicioPostura) return 0;
  const inicio = toDataDia(lote.inicioPostura);
  if (!inicio) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 0;
  return dias === 0 ? 1 : Math.ceil(dias / 7);
}

export function fracaoEsperadaAcumulada(semanaPostura) {
  if (semanaPostura <= 0) return 0;
  const limite = Math.min(semanaPostura, SEMANAS_CICLO_POSTURA);
  let soma = 0;
  for (let s = 1; s <= limite; s++) {
    soma += PRODUCAO_PCT_POR_SEMANA[s] || 0;
  }
  const totalTabela = PRODUCAO_PCT_POR_SEMANA.reduce((a, b) => a + b, 0) || 100;
  return Math.min(1, soma / totalTabela);
}

function custoOvoVazio() {
  return {
    totalCriacao: 0,
    totalPostura: 0,
    totalCama: 0,
    totalOutrosCustos: 0,
    custoFormacaoPorGalinha: 0,
    custoFormacaoPorOvo: 0,
    custoCriacaoPorOvo: 0,
    custoCamaPorOvo: 0,
    totalRacao: 0,
    kgRacaoDistribuida: 0,
    custoRacaoPorOvo: 0,
    totalCartelas: 0,
    custoCartelaPorOvo: 0,
    totalDepreciacao: 0,
    custoDepreciacao: 0,
    custoProjetado: 0,
    precoSugerido: 0,
    desempenho: null,
    margem: MARGEM_DE_LUCRO,
    ovosEsperadosAteHoje: 0,
    semanasPostura: 0,
    totalOvosProduzidos: 0,
    producaoTotalEstimada: 0,
    qtdAtual: 0,
    qtdFormacao: 0,
  };
}

/**
 * Formação da galinha:
 *   custo/galinha = totalCriacao ÷ galinhas no início da postura
 *   custo/ovo     = totalCriacao ÷ (galinhas × prodEstimada)
 *
 * Operacional:
 *   Postura / Cama → diluídos na meta de ovos da formação
 *   Ração → valor PEPS das distribuições ÷ ovos coletados
 *   Cartela → ÷ capacidade
 *   Investimento → parcela mensal ÷ ovos/mês estimados
 */
export async function calcularTudoDoLote(lote, uid) {
  const vazio = {
    producao: 0,
    dadosRelogio: {
      totalOvosProduzidos: 0,
      producaoTotalEstimada: 0,
    },
    custoOvo: custoOvoVazio(),
  };

  if (!lote?.id || !uid) return vazio;

  const qtdGalinhas = qtdAtualLote(lote);
  const qtdFormacao = qtdFormacaoLote(lote);
  const producaoPorGalinha = Number(lote.prodEstimada) || 0;

  const producaoTotalEstimada = qtdFormacao * producaoPorGalinha;

  // --- Ovos ---
  const ovosSnap = await getDocs(
    query(
      collection(db, 'coletaOvos'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    )
  );

  let totalOvosProduzidos = 0;
  const porDia = {};

  ovosSnap.forEach((d) => {
    const data = d.data();
    const qtd = Number(data.qt ?? data.quantidade) || 0;
    totalOvosProduzidos += qtd;

    let diaKey = '';
    const raw = data.data;
    if (raw?.toDate) diaKey = raw.toDate().toISOString().slice(0, 10);
    else if (raw) diaKey = new Date(Number(raw)).toISOString().slice(0, 10);
    if (diaKey) porDia[diaKey] = (porDia[diaKey] || 0) + qtd;
  });

  let producao = 0;
  const diasOrdenados = Object.keys(porDia).sort();
  if (diasOrdenados.length > 0 && qtdGalinhas > 0) {
    const ultimo = diasOrdenados[diasOrdenados.length - 1];
    producao = Number(((porDia[ultimo] / qtdGalinhas) * 100).toFixed(1));
  }

  // --- Custos: Criação, Postura, Cama ---
  const custosSnap = await getDocs(
    query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    )
  );

  let totalCriacao = 0;
  let totalPostura = 0;
  let totalCama = 0;

  custosSnap.forEach((d) => {
    const data = d.data();
    const valor = Number(data.valor) || 0;
    const tipo = data.idade || data.tipo || '';

    if (tipo === 'Criacao') totalCriacao += valor;
    if (tipo === 'Postura') totalPostura += valor;
    if (tipo === 'Cama') totalCama += valor;
  });

  const totalOutrosCustos = totalCriacao + totalPostura + totalCama;

  const custoFormacaoPorGalinha =
    qtdFormacao > 0 ? totalCriacao / qtdFormacao : 0;
  const custoFormacaoPorOvo =
    qtdFormacao > 0 && producaoPorGalinha > 0
      ? totalCriacao / (qtdFormacao * producaoPorGalinha)
      : 0;

  // --- Ração (PEPS: usa data.valor; fallback kg × precoKg) ---
  const racaoSnap = await getDocs(
    query(
      collection(db, 'distribuicaoRacao'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    )
  );

  let totalRacao = 0;
  let kgRacaoDistribuida = 0;

  racaoSnap.forEach((d) => {
    const data = d.data();
    const kg = Number(data.kg) || 0;
    kgRacaoDistribuida += kg;

    const valorLancado = Number(data.valor);
    if (!Number.isNaN(valorLancado) && valorLancado > 0) {
      totalRacao += valorLancado;
    } else if (Array.isArray(data.itens) && data.itens.length > 0) {
      totalRacao += data.itens.reduce(
        (s, i) => s + (Number(i.custo) || 0),
        0
      );
    } else {
      totalRacao += kg * (Number(data.precoKg) || 0);
    }
  });

  // --- Cartelas ---
  const cartelasSnap = await getDocs(
    query(
      collection(db, 'cartelas'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    )
  );

  let totalCartelas = 0;
  let capacidadeTotalOvos = 0;

  cartelasSnap.forEach((d) => {
    const data = d.data();
    const valor = Number(data.valorTotal ?? data.valor) || 0;
    const qtd = Number(data.qtd ?? data.quantidade) || 0;
    const capacidade = Number(data.capacidade) || 0;
    totalCartelas += valor;
    capacidadeTotalOvos += qtd * capacidade;
  });

  // --- Investimentos (conta) ---
  const invSnap = await getDocs(
    query(collection(db, 'investimentos'), where('userId', '==', uid))
  );

  let totalDepreciacaoMes = 0;
  invSnap.forEach((d) => {
    const data = d.data();
    const valor = Number(data.valorTotal) || 0;
    const anos = Number(data.vidaUtilAnos) || 1;
    totalDepreciacaoMes += valor / anos / 12;
  });

  const MESES_POSTURA_ESTIMADOS = 18;
  const ovosMesEstimado =
    producaoTotalEstimada > 0
      ? producaoTotalEstimada / MESES_POSTURA_ESTIMADOS
      : 0;

  const custoPosturaPorOvo =
    producaoTotalEstimada > 0 ? totalPostura / producaoTotalEstimada : 0;
  const custoCamaPorOvo =
    producaoTotalEstimada > 0 ? totalCama / producaoTotalEstimada : 0;
  const custoRacaoPorOvo =
    totalOvosProduzidos > 0 ? totalRacao / totalOvosProduzidos : 0;
  const custoCartelaPorOvo =
    capacidadeTotalOvos > 0 ? totalCartelas / capacidadeTotalOvos : 0;
  const custoDepreciacaoPorOvo =
    ovosMesEstimado > 0 ? totalDepreciacaoMes / ovosMesEstimado : 0;

  const custoProjetado =
    custoFormacaoPorOvo +
    custoPosturaPorOvo +
    custoCamaPorOvo +
    custoRacaoPorOvo +
    custoCartelaPorOvo +
    custoDepreciacaoPorOvo;

  const precoSugerido = custoProjetado * (1 + MARGEM_DE_LUCRO);

  const semanasPostura = calcularSemanasPostura(lote);
  const fracao = fracaoEsperadaAcumulada(semanasPostura);
  const ovosEsperadosAteHoje = producaoTotalEstimada * fracao;

  let desempenho = null;
  if (lote.inicioPostura && ovosEsperadosAteHoje > 0) {
    desempenho = totalOvosProduzidos / ovosEsperadosAteHoje;
  }

  return {
    producao,
    dadosRelogio: {
      totalOvosProduzidos,
      producaoTotalEstimada,
    },
    custoOvo: {
      totalCriacao: Number(totalCriacao.toFixed(2)),
      totalPostura: Number(totalPostura.toFixed(2)),
      totalCama: Number(totalCama.toFixed(2)),
      totalOutrosCustos: Number(totalOutrosCustos.toFixed(2)),
      custoFormacaoPorGalinha: Number(custoFormacaoPorGalinha.toFixed(2)),
      custoFormacaoPorOvo: Number(custoFormacaoPorOvo.toFixed(4)),
      custoCriacaoPorOvo: Number(custoFormacaoPorOvo.toFixed(4)),
      custoCamaPorOvo: Number(custoCamaPorOvo.toFixed(4)),
      totalRacao: Number(totalRacao.toFixed(2)),
      kgRacaoDistribuida: Number(kgRacaoDistribuida.toFixed(3)),
      custoRacaoPorOvo: Number(custoRacaoPorOvo.toFixed(4)),
      totalCartelas: Number(totalCartelas.toFixed(2)),
      custoCartelaPorOvo: Number(custoCartelaPorOvo.toFixed(4)),
      totalDepreciacao: Number(totalDepreciacaoMes.toFixed(2)),
      custoDepreciacao: Number(custoDepreciacaoPorOvo.toFixed(4)),
      custoProjetado: Number(custoProjetado.toFixed(4)),
      precoSugerido: Number(precoSugerido.toFixed(2)),
      desempenho,
      margem: MARGEM_DE_LUCRO,
      ovosEsperadosAteHoje: Number(ovosEsperadosAteHoje.toFixed(0)),
      semanasPostura,
      totalOvosProduzidos,
      producaoTotalEstimada,
      qtdAtual: qtdGalinhas,
      qtdFormacao,
    },
  };
}