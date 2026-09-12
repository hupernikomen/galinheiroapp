import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConnection/firebase';

/**
 * Monta o estoque por compra (camadas), do mais antigo ao mais novo.
 * Cada compra tem kgRestante = comprado - já consumido em distribuições.
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

  const distribuicoes = snapDist.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      kg: Number(data.kg) || 0,
      data: Number(data.data) || 0,
      // formato novo: vários itens
      itens: Array.isArray(data.itens) ? data.itens : null,
      // formato antigo: um estoqueId
      estoqueId: data.estoqueId || null,
    };
  });

  const usadoPorCompra = {};
  compras.forEach((c) => {
    usadoPorCompra[c.id] = 0;
  });

  // 1) Distribuições novas: somam pelos itens[]
  const semCamada = [];

  distribuicoes.forEach((d) => {
    if (d.itens && d.itens.length > 0) {
      d.itens.forEach((item) => {
        const id = item.estoqueId;
        const kg = Number(item.kg) || 0;
        if (id && usadoPorCompra[id] !== undefined) {
          usadoPorCompra[id] += kg;
        }
      });
    } else if (d.estoqueId && usadoPorCompra[d.estoqueId] !== undefined) {
      usadoPorCompra[d.estoqueId] += d.kg;
    } else {
      semCamada.push(d);
    }
  });

  // 2) Distribuições antigas sem vínculo: consome FIFO nas compras
  semCamada
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
      kgRestante: Math.max(0, c.kg - (usadoPorCompra[c.id] || 0)),
    }))
    .filter((c) => c.kgRestante > 0.0001);

  const kgTotal = comSaldo.reduce((s, c) => s + c.kgRestante, 0);

  // Próximo preço a usar = da compra mais antiga que ainda tem saldo
  const proximaCamada = comSaldo[0] || null;
  const precoAtualKg = proximaCamada ? proximaCamada.precoKg : 0;

  return {
    comSaldo,
    kgTotal,
    precoAtualKg,
    proximaCamada,
  };
}

/**
 * Consome kg no estoque em ordem FIFO e devolve as fatias usadas.
 */
function consumirFifo(comSaldo, kgPedido) {
  let falta = kgPedido;
  const itens = [];
  let custoTotal = 0;

  for (const camada of comSaldo) {
    if (falta <= 0) break;
    const tira = Math.min(camada.kgRestante, falta);
    if (tira <= 0) continue;

    const custo = tira * camada.precoKg;
    itens.push({
      estoqueId: camada.id,
      kg: Number(tira.toFixed(4)),
      precoKg: Number(camada.precoKg.toFixed(4)),
      custo: Number(custo.toFixed(2)),
      dataCompra: camada.data,
    });
    custoTotal += custo;
    falta -= tira;
  }

  if (falta > 0.0001) {
    throw new Error('Saldo insuficiente no estoque de ração');
  }

  return {
    itens,
    custoTotal: Number(custoTotal.toFixed(2)),
  };
}

/**
 * Consumo de ração no lote (PEPS).
 * Só cria registro em distribuicaoRacao.
 * NÃO altera o documento de estoqueRacao.
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

  const { comSaldo, kgTotal, precoAtualKg } = await obterEstoqueUsuario(uid);

  if (kgNum > kgTotal + 0.0001) {
    throw new Error(
      `Saldo insuficiente. Disponível: ${kgTotal.toLocaleString('pt-BR', {
        maximumFractionDigits: 1,
      })} kg`
    );
  }

  if (!comSaldo.length || precoAtualKg <= 0) {
    throw new Error(
      'Não há ração com preço no estoque. Cadastre uma compra antes.'
    );
  }

  const { itens, custoTotal } = consumirFifo(comSaldo, kgNum);

  // preço médio só desta saída (para telas que ainda leem precoKg)
  const precoEfetivoKg = kgNum > 0 ? custoTotal / kgNum : 0;

  await addDoc(collection(db, 'distribuicaoRacao'), {
    data,
    loteId,
    kg: kgNum,
    valor: custoTotal,
    precoKg: Number(precoEfetivoKg.toFixed(4)),
    itens,
    userId: uid,
  });

  return {
    valor: custoTotal,
    kg: kgNum,
    precoKg: precoEfetivoKg,
    itens,
  };
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

/** Exporta para a tela NovoCusto (dica de estoque) */
export async function consultarEstoqueRacao(uid) {
  if (!uid) {
    return { kgTotal: 0, precoAtualKg: 0, comSaldo: [] };
  }
  return obterEstoqueUsuario(uid);
}