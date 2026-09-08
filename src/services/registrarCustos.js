import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

/**
 * Lista compras com saldo, preço médio ponderado e ordem FIFO (mais antigo primeiro).
 */
async function obterEstoqueUsuario(uid) {
  const snap = await getDocs(
    query(collection(db, 'estoqueRacao'), where('userId', '==', uid))
  );

  const itens = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    kgRestante: Number(d.data().kgRestante ?? d.data().kg) || 0,
    precoKg: Number(d.data().precoKg) || 0,
    data: Number(d.data().data) || 0,
  }));

  const comSaldo = itens
    .filter((i) => i.kgRestante > 0.0001)
    .sort((a, b) => a.data - b.data);

  let kgTotal = 0;
  let valorPonderado = 0;

  comSaldo.forEach((i) => {
    kgTotal += i.kgRestante;
    valorPonderado += i.kgRestante * i.precoKg;
  });

  const precoMedioKg = kgTotal > 0 ? valorPonderado / kgTotal : 0;

  return { comSaldo, kgTotal, precoMedioKg };
}

/**
 * Consumo de ração no lote.
 * - Não escolhe compra
 * - Usa preço médio do estoque
 * - Baixa kg em FIFO
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

  const { comSaldo, kgTotal, precoMedioKg } = await obterEstoqueUsuario(uid);

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

  let restante = kgNum;
  const batch = writeBatch(db);

  for (const item of comSaldo) {
    if (restante <= 0) break;
    const tira = Math.min(item.kgRestante, restante);
    batch.update(doc(db, 'estoqueRacao', item.id), {
      kgRestante: increment(-tira),
    });
    restante -= tira;
  }

  await batch.commit();

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