import { useState, useEffect, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from '../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';

export const GeralContext = createContext({});

const MARGEM_DE_LUCRO = 0.60;

function GeralProvider({ children }) {

  const [load, setLoad] = useState(false)

  const [lote, setLote] = useState(null);

  const [producao, setProducao] = useState(0);
  const [custoOvo, setCustoOvo] = useState(null);
  const [dadosRelogio, setDadosRelogio] = useState({
    totalOvosProduzidos: 0,
    producaoTotalEstimada: 0,
  });



  // Sempre que o lote mudar, escuta ovos e custos em tempo real
  useEffect(() => {
    if (!lote?.id) {
      setProducao(0);
      setCustoOvo(null);
      setDadosRelogio({ totalOvosProduzidos: 0, producaoTotalEstimada: 0 });
      return;
    }

    const unsubOvos = onSnapshot(
      query(collection(db, "coletaOvos"), where("loteId", "==", lote.id)),
      () => calcularTudo()
    );

    const unsubCustos = onSnapshot(
      query(collection(db, "custos"), where("loteId", "==", lote.id)),
      () => calcularTudo()
    );

    calcularTudo();


    return () => {
      unsubOvos();
      unsubCustos();
    };
  }, [lote?.id]);

async function calcularTudo() {
  setLoad(true);

  try {
    if (!lote?.id) {
      setProducao(0);
      setCustoOvo(null);
      setDadosRelogio({ totalOvosProduzidos: 0, producaoTotalEstimada: 0 });
      return;
    }

    const qtdGalinhas = Number(lote.qtAtual) || 0;
    const producaoPorGalinha = Number(lote.prodEstimada) || 0;
    const producaoTotalEstimada = qtdGalinhas * producaoPorGalinha;

    // ========== 1. OVOS ==========
    const ovosSnap = await getDocs(
      query(collection(db, 'coletaOvos'), where('loteId', '==', lote.id))
    );

    let totalOvosProduzidos = 0;
    const porDia = {};

    ovosSnap.forEach((docSnap) => {
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

    // Produção média diária (%)
    if (qtdGalinhas > 0 && Object.keys(porDia).length > 0) {
      const producoes = Object.values(porDia).map(
        (total) => (total / qtdGalinhas) * 100
      );
      const media =
        producoes.reduce((a, b) => a + b, 0) / producoes.length;
      setProducao(Number(media.toFixed(1)));
    } else {
      setProducao(0);
    }

    setDadosRelogio({
      totalOvosProduzidos,
      producaoTotalEstimada,
    });

    // ========== 2. CUSTOS DO LOTE ==========
    const custosSnap = await getDocs(
      query(collection(db, 'custos'), where('loteId', '==', lote.id))
    );

    let totalCriacao = 0;
    let totalPostura = 0;

    custosSnap.forEach((docSnap) => {
      const c = docSnap.data();
      const valor = Number(c.valor) || 0;
      if (c.idade === 'Criacao') totalCriacao += valor;
      if (c.idade === 'Postura') totalPostura += valor;
    });

    // ========== 3. DEPRECIAÇÃO (investimentos da granja) ==========
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
    const depreciacaoNoLote = parcelaDepreciacaoMes / qtdAtivos;

    // ========== 4. CUSTO PROJETADO (estável) ==========
    // Tudo diluído na produção de vida inteira da galinha
    const gastosTotais =
      totalCriacao + totalPostura + depreciacaoNoLote;

    const custoProjetado =
      producaoTotalEstimada > 0
        ? gastosTotais / producaoTotalEstimada
        : 0;

    const precoSugerido = custoProjetado * (1 + MARGEM_DE_LUCRO);

    // ========== 5. DESEMPENHO (coletado vs esperado) ==========
    const SEMANA_INICIO_POSTURA = 18;
    const SEMANAS_POSTURA = 72; // 90 - 18

    let semanas = 0;
    if (lote?.chegada) {
      const dataChegada = lote.chegada?.toDate
        ? lote.chegada.toDate()
        : new Date(Number(lote.chegada));

      // timestamp em segundos → milissegundos
      let ts = Number(lote.chegada);
      if (!lote.chegada?.toDate && ts > 0 && ts < 10000000000) {
        dataChegada.setTime(ts * 1000);
      }

      const hoje = new Date();
      dataChegada.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);

      const dias = Math.floor(
        (hoje - dataChegada) / (1000 * 60 * 60 * 24)
      );
      semanas = dias <= 0 ? 1 : Math.ceil(dias / 7);
    }

    const semanasDePostura = Math.max(0, semanas - SEMANA_INICIO_POSTURA);
    const fracaoPostura = Math.min(
      semanasDePostura / SEMANAS_POSTURA,
      1
    );

    // Ainda em criação → sem meta de ovos
    const ovosEsperadosAteHoje =
      semanasDePostura > 0
        ? producaoTotalEstimada * fracaoPostura
        : 0;

    const desempenho =
      ovosEsperadosAteHoje > 0
        ? totalOvosProduzidos / ovosEsperadosAteHoje
        : null;

    // ========== 6. RESULTADO ==========
    setCustoOvo({
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
      // para o gráfico antigo continuar funcionando
      custoTotal: Number(custoProjetado.toFixed(4)),
      custoDepreciacao:
        producaoTotalEstimada > 0
          ? Number((depreciacaoNoLote / producaoTotalEstimada).toFixed(4))
          : 0,
    });
  } catch (error) {
    console.log('Erro ao calcular:', error);
  } finally {
    setLoad(false);
  }
}



  async function salvarLote(novoLote) {
    setLote(novoLote);
    await AsyncStorage.setItem('@lote', JSON.stringify(novoLote));
  }

  function calcularSemanasLote() {
    if (!lote?.chegada) return 0;

    const dataChegada = lote.chegada?.toDate
      ? lote.chegada.toDate()
      : new Date(Number(lote.chegada));

    const hoje = new Date();
    dataChegada.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const dias = Math.floor((hoje - dataChegada) / (1000 * 60 * 60 * 24));
    return dias <= 0 ? 1 : Math.ceil(dias / 7);
  }

  function formatarData(data) {
    if (!data) return "";
    return new Date(Number(data)).toLocaleDateString("pt-BR");
  }

  return (
    <GeralContext.Provider value={{
      lote,
      setLote: salvarLote,
      producao,
      custoOvo,
      dadosRelogio,
      calcularSemanasLote,
      formatarData,
      load
    }}>
      {children}
    </GeralContext.Provider>
  );
}

export default GeralProvider;