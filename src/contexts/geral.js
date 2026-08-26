import { useState, useEffect, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from '../services/firebaseConnection/firebase';
import {
  collection, query, where,
  onSnapshot, doc, getDocs
} from "firebase/firestore";

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

    console.log(lote, 'geral');
    

    setLoad(true)

    try {
      if (!lote?.id) return;

      const qtdGalinhas = Number(lote.qtAtual) || 0;
      const producaoPorGalinha = Number(lote.prodEstimada) || 0;
      const producaoTotalEstimada = qtdGalinhas * producaoPorGalinha;

      // Busca ovos
      const ovosSnap = await getDocs(
        query(collection(db, "coletaOvos"), where("loteId", "==", lote.id))
      );

      let totalOvosProduzidos = 0;
      const porDia = {};

      ovosSnap.forEach((doc) => {
        const data = doc.data();
        const qtd = Number(data.qt) || 0;
        totalOvosProduzidos += qtd;

        let dia;
        if (data.data?.toDate) {
          dia = data.data.toDate().toISOString().slice(0, 10);
        } else if (data.data) {
          dia = new Date(data.data).toISOString().slice(0, 10);
        } else return;

        porDia[dia] = (porDia[dia] || 0) + qtd;
      });

      // Produção
      if (qtdGalinhas > 0 && Object.keys(porDia).length > 0) {
        const producoes = Object.values(porDia).map(total => (total / qtdGalinhas) * 100);
        const media = producoes.reduce((a, b) => a + b, 0) / producoes.length;
        setProducao(Number(media.toFixed(1)));
      } else {
        setProducao(0);
      }

      setDadosRelogio({
        totalOvosProduzidos,
        producaoTotalEstimada,
      });

      // Busca custos
      const custosSnap = await getDocs(
        query(collection(db, "custos"), where("loteId", "==", lote.id))
      );

      let totalCriacao = 0;
      let totalPostura = 0;

      custosSnap.forEach((doc) => {
        const valor = Number(doc.data().valor) || 0;
        if (doc.data().idade === "Criacao") totalCriacao += valor;
        if (doc.data().idade === "Postura") totalPostura += valor;
      });

      const custoFixo = producaoTotalEstimada > 0 ? totalCriacao / producaoTotalEstimada : 0;
      const custoVariavel = totalOvosProduzidos > 0 ? totalPostura / totalOvosProduzidos : 0;
      const custoTotal = custoFixo + custoVariavel;

      // Só atualiza se o valor for diferente do atual (evita renders desnecessários)
setCustoOvo({
  totalCriacao: Number(totalCriacao.toFixed(2)),
  totalPostura: Number(totalPostura.toFixed(2)),
  custoFixo: Number(custoFixo.toFixed(2)),
  custoVariavel: Number(custoVariavel.toFixed(2)),
  custoTotal: Number(custoTotal.toFixed(2)),
});

    } catch (error) {
      console.log("Erro ao calcular:", error);
    } finally {
      setLoad(false)
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