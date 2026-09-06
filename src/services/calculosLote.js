import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

const MARGEM_DE_LUCRO = 0.6;

/** Semanas de postura usadas na curva (aprox. ciclo de postura) */
const SEMANAS_CICLO_POSTURA = 72;

/**
 * % da produção total da vida esperado em cada semana de postura (não acumulado).
 * Valores de teste — soma ≈ 100. Ajuste depois por raça se quiser.
 * Índice 1 = primeira semana após inicioPostura.
 */
const PRODUCAO_PCT_POR_SEMANA = [
  0, // índice 0 não usado
  0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.5, 3.8, // 1–10
  3.9, 3.9, 3.8, 3.7, 3.5, 3.3, 3.1, 2.9, 2.7, 2.5, // 11–20
  2.3, 2.2, 2.1, 2.0, 1.9, 1.8, 1.7, 1.6, 1.5, 1.5, // 21–30
  1.4, 1.4, 1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0, 1.0, // 31–40
  0.95, 0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.75, 0.75, 0.7, // 41–50
  0.7, 0.65, 0.65, 0.6, 0.6, 0.55, 0.55, 0.5, 0.5, 0.45, // 51–60
  0.45, 0.4, 0.4, 0.35, 0.35, 0.3, 0.3, 0.25, 0.25, 0.2, // 61–70
  0.2, 0.15, // 71–72
];

/** Timestamp / Date / segundos → Date no dia (00:00) */
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

/** Semanas de vida do lote a partir de chegada */
export function calcularSemanasLote(lote) {
  if (!lote?.chegada) return 0;

  const dataChegada = toDataDia(lote.chegada);
  if (!dataChegada) return 0;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias = Math.floor((hoje - dataChegada) / (1000 * 60 * 60 * 24));
  return dias <= 0 ? 1 : Math.ceil(dias / 7);
}

/** Semanas desde o início da postura (1 = primeira semana) */
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

/**
 * Fração acumulada (0–1) da produção total esperada até a semana de postura.
 */
export function fracaoEsperadaAcumulada(semanaPostura) {
  if (semanaPostura <= 0) return 0;

  const limite = Math.min(semanaPostura, SEMANAS_CICLO_POSTURA);
  let soma = 0;
  for (let s = 1; s <= limite; s++) {
    soma += PRODUCAO_PCT_POR_SEMANA[s] || 0;
  }
  // normaliza caso a tabela não some exatamente 100
  const totalTabela = PRODUCAO_PCT_POR_SEMANA.reduce((a, b) => a + b, 0) || 100;
  return Math.min(1, soma / totalTabela);
}

/**
 * Calcula produção do dia e custo projetado do ovo.
 * Desempenho = ovos reais ÷ ovos esperados até hoje (curva a partir de inicioPostura).
 */
export async function calcularTudoDoLote(lote, uid) {
  const vazio = {
    producao: 0,
    dadosRelogio: {
      totalOvosProduzidos: 0,
      producaoTotalEstimada: 0,
    },
    custoOvo: {
      totalCriacao: 0,
      totalPostura: 0,
      totalDepreciacao: 0,
      custoProjetado: 0,
      precoSugerido: 0,
      desempenho: null,
      margem: MARGEM_DE_LUCRO,
      custoDepreciacao: 0,
      ovosEsperadosAteHoje: 0,
      semanasPostura: 0,
    },
  };

  if (!lote?.id || !uid) {
    return vazio;
  }

  const qtdGalinhas = Number(lote.qtAtual ?? lote.qt) || 0;
  const producaoPorGalinha = Number(lote.prodEstimada) || 0;
  const producaoTotalEstimada = qtdGalinhas * producaoPorGalinha;

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
    if (raw?.toDate) {
      diaKey = raw.toDate().toISOString().slice(0, 10);
    } else if (raw) {
      diaKey = new Date(Number(raw)).toISOString().slice(0, 10);
    }
    if (diaKey) {
      porDia[diaKey] = (porDia[diaKey] || 0) + qtd;
    }
  });

  // Produção % do último dia (ovos / galinhas)
  let producao = 0;
  const diasOrdenados = Object.keys(porDia).sort();
  if (diasOrdenados.length > 0 && qtdGalinhas > 0) {
    const ultimo = diasOrdenados[diasOrdenados.length - 1];
    producao = Number(((porDia[ultimo] / qtdGalinhas) * 100).toFixed(1));
  }

  // --- Custos ---
  const custosSnap = await getDocs(
    query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    )
  );

  let totalCriacao = 0;
  let totalPostura = 0;

  custosSnap.forEach((d) => {
    const data = d.data();
    const valor = Number(data.valor) || 0;
    const tipo = data.idade || data.tipo || '';
    if (tipo === 'Criacao') totalCriacao += valor;
    if (tipo === 'Postura') totalPostura += valor;
  });

  // --- Investimentos ---
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

  const custoCriacaoPorOvo =
    producaoTotalEstimada > 0 ? totalCriacao / producaoTotalEstimada : 0;
  const custoPosturaPorOvo =
    producaoTotalEstimada > 0 ? totalPostura / producaoTotalEstimada : 0;
  const custoDepreciacaoPorOvo =
    ovosMesEstimado > 0 ? totalDepreciacaoMes / ovosMesEstimado : 0;

  const custoProjetado =
    custoCriacaoPorOvo + custoPosturaPorOvo + custoDepreciacaoPorOvo;
  const precoSugerido = custoProjetado * (1 + MARGEM_DE_LUCRO);

  // --- Desempenho pela curva (a partir de inicioPostura) ---
  const semanasPostura = calcularSemanasPostura(lote);
  const fracao = fracaoEsperadaAcumulada(semanasPostura);
  const ovosEsperadosAteHoje = producaoTotalEstimada * fracao;

  let desempenho = null;
  if (!lote.inicioPostura) {
    // Ainda não houve primeira coleta marcada como início
    desempenho = null;
  } else if (ovosEsperadosAteHoje > 0) {
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
      totalDepreciacao: Number(totalDepreciacaoMes.toFixed(2)),
      custoProjetado: Number(custoProjetado.toFixed(4)),
      precoSugerido: Number(precoSugerido.toFixed(2)),
      desempenho,
      margem: MARGEM_DE_LUCRO,
      custoDepreciacao: Number(custoDepreciacaoPorOvo.toFixed(4)),
      ovosEsperadosAteHoje: Number(ovosEsperadosAteHoje.toFixed(0)),
      semanasPostura,
    },
  };
}