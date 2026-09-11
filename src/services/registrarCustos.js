import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

/**
 * Saldo = soma(kg comprados) - soma(kg distribuídos)
 * Preço médio = média ponderada do que ainda resta (FIFO virtual, sem alterar o estoque)
 */
async function obterEstoqueUsuario(uid) {
  const [snapEstoque, snapDist] = await Promise.all([
    getDocs(
      query(collection(db, 'estoqueRacao'), where('userId', '==', uid))
    ),
    getDocs(
      query(collection(db, 'distribuicaoRacao'), where('userId', '==', uid))
    ),
  ]);

  const compras = snapEstoque.docs
    .map((d) => ({
      id: d.id,
      kg: Number(d.data().kg) || 0,
      precoKg: Number(d.data().precoKg) || 0,
      data: Number(d.data().data) || 0,
    }))
    .sort((a, b) => a.data - b.data);

  const distribuicoes = snapDist.docs.map((d) => ({
    id: d.id,
    kg: Number(d.data().kg) || 0,
    estoqueId: d.data().estoqueId || null,
    data: Number(d.data().data) || 0,
  }));

  const totalComprado = compras.reduce((s, c) => s + c.kg, 0);
  const totalDistribuido = distribuicoes.reduce((s, d) => s + d.kg, 0);
  const kgTotal = totalComprado - totalDistribuido;

  // Quanto cada compra já “perdeu” (por estoqueId, se existir)
  const usadoPorCompra = {};
  compras.forEach((c) => {
    usadoPorCompra[c.id] = 0;
  });

  const semEstoqueId = [];

  distribuicoes.forEach((d) => {
    if (d.estoqueId && usadoPorCompra[d.estoqueId] !== undefined) {
      usadoPorCompra[d.estoqueId] += d.kg;
    } else {
      semEstoqueId.push(d);
    }
  });

  // Distribuições antigas sem estoqueId: consome FIFO nas compras
  semEstoqueId
    .sort((a, b) => a.data - b.data)
    .forEach((d) => {
      let falta = d.kg;
      for (const c of compras) {
        if (falta <= 0) break;
        const rest = Math.max(0, c.kg - usadoPorCompra[c.id]);
        const tira = Math.min(rest, falta);
        usadoPorCompra[c.id] += tira;
        falta -= tira;
      }
    });

  const comSaldo = compras
    .map((c) => ({
      ...c,
      kgRestante: Math.max(0, c.kg - usadoPorCompra[c.id]),
    }))
    .filter((c) => c.kgRestante > 0.0001);

  let valorPonderado = 0;
  let kgParaMedia = 0;
  comSaldo.forEach((c) => {
    kgParaMedia += c.kgRestante;
    valorPonderado += c.kgRestante * c.precoKg;
  });

  const precoMedioKg = kgParaMedia > 0 ? valorPonderado / kgParaMedia : 0;

  return { comSaldo, kgTotal, precoMedioKg };
}

/**
 * Consumo de ração no lote.
 * Só cria registro em distribuicaoRacao.
 * NÃO altera estoqueRacao.
 */
export async function registrarRacao({
  uid,
  loteId,
  kg,
  data = Date.now(),
}) {
  if (!uid) throw new Error('Usuário não logado');
  if (!loteId) throw new Error('Selecione um lote');

  const kgNum = Number(String(kg).replace(',', '.'));
  if (!kgNum || kgNum <= 0) {
    throw new Error('Informe a quantidade em kg');
  }

  const { kgTotal, precoMedioKg } = await obterEstoqueUsuario(uid);

  if (kgNum > kgTotal + 0.0001) {
    throw new Error(
      `Saldo insuficiente. Disponível: ${kgTotal.toLocaleString('pt-BR', {
        maximumFractionDigits: 1,
      })} kg`
    );
  }

  if (precoMedioKg <= 0) {
    throw new Error(
      'Não há preço de ração no estoque. Cadastre uma compra antes.'
    );
  }

  const valor = Number((kgNum * precoMedioKg).toFixed(2));

  await addDoc(collection(db, 'distribuicaoRacao'), {
    data,
    loteId,
    kg: kgNum,
    precoKg: Number(precoMedioKg.toFixed(4)),
    valor,
    userId: uid,
  });

  return { valor, kg: kgNum, precoMedioKg };
}

/** Cartela vinculada ao lote */
export async function registrarCartela({
  uid,
  loteId,
  descricao = 'Cartela',
  qtd,
  capacidade,
  valorTotal,
  data = Date.now(),
}) {
  if (!uid) throw new Error('Usuário não logado');
  if (!loteId) throw new Error('Selecione um lote');

  const qtdNum = Number(qtd);
  const capNum = Number(capacidade);
  const valorNum = Number(String(valorTotal).replace(',', '.'));

  if (!qtdNum || !capNum || !valorNum) {
    throw new Error('Preencha quantidade, capacidade e valor');
  }

  await addDoc(collection(db, 'cartelas'), {
    data,
    loteId,
    descricao: String(descricao).trim() || 'Cartela',
    qtd: qtdNum,
    capacidade: capNum,
    valorTotal: valorNum,
    userId: uid,
  });

  return { valorTotal: valorNum, ovos: qtdNum * capNum };
}

/** Cama do lote (diluída na produção estimada) */
export async function registrarCama({
  uid,
  loteId,
  descricao = 'Cama',
  valor,
  data = Date.now(),
}) {
  if (!uid) throw new Error('Usuário não logado');
  if (!loteId) throw new Error('Selecione um lote');

  const valorNum = Number(String(valor).replace(',', '.'));
  if (!valorNum || valorNum <= 0) {
    throw new Error('Informe o valor da cama');
  }

  await addDoc(collection(db, 'custos'), {
    data,
    loteId,
    descricao: String(descricao).trim() || 'Cama',
    valor: valorNum,
    idade: 'Cama',
    userId: uid,
  });

  return { valor: valorNum };
}