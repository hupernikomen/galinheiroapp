import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

const MARGEM_DE_LUCRO = 0.60;

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

/**
 * Calcula produção, relógio e custo do ovo
 * @param {object} lote
 * @param {string} uid - usuário logado (obrigatório para filtrar)
 */
export async function calcularTudoDoLote(lote, uid) {
  const vazio = {
    producao: 0,
    dadosRelogio: {
      totalOvosProduzidos: 0,
      producaoTotalEstimada: 0,
    },
    custoOvo: null,
  };

  if (!lote?.id || !uid) {
    return vazio;
  }

  const qtdGalinhas = Number(lote.qtAtual) || Number(lote.qt) || 0;
  const producaoPorGalinha = Number(lote.prodEstimada) || 0;
  const producaoTotalEstimada = qtdGalinhas * producaoPorGalinha;

  // Ovos do lote + do usuário
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
    const qtd = Number(data.qt) || 0;
    totalOvosProduzidos += qtd;

    let dia;
    if (data.data?.toDate) {
      dia = data.data.toDate().toISOString().slice(0, 10);
    } else {
      dia = new Date(Number(data.data) || Date.now()).toISOString().slice(0, 10);
    }
    porDia[dia] = (porDia[dia] || 0) + qtd;
  });

  // Produção %: média dos dias (ovos do dia / galinhas * 100)
  const divisor = qtdGalinhas || 1;
  const percentuais = Object.values(porDia).map((total) =>
    Number(((total / divisor) * 100).toFixed(1))
  );
  const producao =
    percentuais.length > 0
      ? Number(
          (
            percentuais.reduce((a, b) => a + b, 0) / percentuais.length
          ).toFixed(1)
        )
      : 0;

  // Custos do lote + do usuário
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
    const c = d.data();
    const valor = Number(c.valor) || 0;
    if (c.idade === 'Criacao') totalCriacao += valor;
    if (c.idade === 'Postura') totalPostura += valor;
  });

  // Investimentos do usuário
  let totalDepreciacaoMes = 0;
  try {
    const invSnap = await getDocs(
      query(collection(db, 'investimentos'), where('userId', '==', uid))
    );
    invSnap.forEach((d) => {
      const inv = d.data();
      const valor = Number(inv.valorTotal) || 0;
      const anos = Number(inv.vidaUtilAnos) || 1;
      totalDepreciacaoMes += valor / anos / 12;
    });
  } catch (e) {
    console.log('Erro investimentos no cálculo:', e);
  }

// Criação + postura diluídos na meta de ovos da vida
const custoFixo = producaoTotalEstimada > 0 ? totalCriacao / producaoTotalEstimada : 0;
const custoPostura = producaoTotalEstimada > 0 ? totalPostura / producaoTotalEstimada : 0;
const custoDepreciacao = ovosMesEstimado > 0 ? totalDepreciacaoMes / ovosMesEstimado : 0;

const custoProjetado = custoFixo + custoPostura + custoDepreciacao;
const precoSugerido = custoProjetado * (1 + MARGEM_DE_LUCRO);

// Progresso da meta de vida (não "esperado até hoje")
const desempenho =
  producaoTotalEstimada > 0
    ? totalOvosProduzidos / producaoTotalEstimada
    : null;

  return {
    producao,
    dadosRelogio: {
      totalOvosProduzidos,
      producaoTotalEstimada,
    },
    custoOvo: {
      totalCriacao,
      totalPostura,
      totalOvosProduzidos,
      producaoTotalEstimada,
      custoFixo: Number(custoFixo.toFixed(4)),
      custoVariavel: Number(custoVariavel.toFixed(4)),
      custoDepreciacao: Number(custoDepreciacao.toFixed(4)),
      totalDepreciacao: Number(totalDepreciacaoMes.toFixed(2)),
      custoProjetado: Number(custoProjetado.toFixed(4)),
      precoSugerido: Number(precoSugerido.toFixed(4)),
      desempenho,
      margem: MARGEM_DE_LUCRO,
    },
  };
}