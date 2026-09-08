import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

/** Ração: baixa estoque e lança distribuição no lote */
export async function registrarRacao({
  uid,
  loteId,
  estoqueId,
  kg,
  data = Date.now(),
}) {
  if (!uid) throw new Error('Usuário não logado');
  if (!loteId) throw new Error('Selecione um lote');
  if (!estoqueId) throw new Error('Selecione o estoque de ração');

  const kgNum = Number(kg);
  if (!kgNum || kgNum <= 0) {
    throw new Error('Informe a quantidade em kg');
  }

  const estoqueRef = doc(db, 'estoqueRacao', estoqueId);
  const estoqueSnap = await getDoc(estoqueRef);
  if (!estoqueSnap.exists()) {
    throw new Error('Estoque não encontrado');
  }

  const estoque = estoqueSnap.data();
  if (estoque.userId !== uid) {
    throw new Error('Estoque inválido');
  }

  const saldo = Number(estoque.kgRestante ?? estoque.kg) || 0;
  if (kgNum > saldo + 0.0001) {
    throw new Error('Quantidade maior que o saldo do estoque');
  }

  const precoKg = Number(estoque.precoKg) || 0;
  const valor = Number((kgNum * precoKg).toFixed(2));

  await addDoc(collection(db, 'distribuicaoRacao'), {
    data,
    loteId,
    estoqueId,
    kg: kgNum,
    precoKg,
    valor,
    userId: uid,
  });

  await updateDoc(estoqueRef, {
    kgRestante: increment(-kgNum),
  });

  return { valor, kg: kgNum };
}

/** Cartela: embalagem vinculada ao lote */
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
  const valorNum = Number(valorTotal);

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

/**
 * Cama: custo do lote
 * No ovo: total ÷ produção estimada do lote
 */
export async function registrarCama({
  uid,
  loteId,
  descricao = 'Cama',
  valor,
  data = Date.now(),
}) {
  if (!uid) throw new Error('Usuário não logado');
  if (!loteId) throw new Error('Selecione um lote');

  const valorNum = Number(valor);
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