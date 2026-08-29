import { useState, useEffect, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebaseConnection/firebase';
import {
  calcularTudoDoLote,
  calcularSemanasLote as calcSemanas,
} from '../services/calculosLote';
import { formatarData } from '../utils/format';

export const GeralContext = createContext({});

function GeralProvider({ children }) {
  const [load, setLoad] = useState(false);
  const [lote, setLote] = useState(null);
  const [listaLotes, setListaLotes] = useState([]);
  const [producao, setProducao] = useState(0);
  const [custoOvo, setCustoOvo] = useState(null);
  const [dadosRelogio, setDadosRelogio] = useState({
    totalOvosProduzidos: 0,
    producaoTotalEstimada: 0,
  });

  // Lista de lotes em tempo real + último lote salvo
  useEffect(() => {
    const unsubLotes = onSnapshot(collection(db, 'lotes'), (snapshot) => {
      const dados = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setListaLotes(dados);
    });

    AsyncStorage.getItem('@lote').then((res) => {
      if (res) {
        try {
          setLote(JSON.parse(res));
        } catch (e) {
          console.log('Erro ao ler lote salvo:', e);
        }
      }
    });

    return () => unsubLotes();
  }, []);

  // Quando o lote muda: escuta ovos/custos e recalcula
  useEffect(() => {
    if (!lote?.id) {
      setProducao(0);
      setCustoOvo(null);
      setDadosRelogio({ totalOvosProduzidos: 0, producaoTotalEstimada: 0 });
      return;
    }

    // Recalcula sempre que ovos ou custos do lote mudarem
    const qOvos = query(
      collection(db, 'coletaOvos'),
      where('loteId', '==', lote.id)
    );
    const qCustos = query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id)
    );

    const unsubOvos = onSnapshot(qOvos, () => {
      calcularTudo();
    });

    const unsubCustos = onSnapshot(qCustos, () => {
      calcularTudo();
    });

    // Também escuta investimentos (depreciação)
    const unsubInv = onSnapshot(collection(db, 'investimentos'), () => {
      calcularTudo();
    });

    // Primeira carga
    calcularTudo();

    return () => {
      unsubOvos();
      unsubCustos();
      unsubInv();
    };
  }, [lote?.id]);

  async function calcularTudo() {
    if (!lote?.id) return;

    setLoad(true);
    try {
      // Usa o lote mais atual da lista (qtAtual, status, etc.)
      const loteAtual =
        listaLotes.find((l) => l.id === lote.id) || lote;

      const resultado = await calcularTudoDoLote(loteAtual);

      setProducao(resultado.producao);
      setDadosRelogio(resultado.dadosRelogio);
      setCustoOvo(resultado.custoOvo);
    } catch (error) {
      console.log('Erro ao calcular:', error);
    } finally {
      setLoad(false);
    }
  }

  async function salvarLote(novoLote) {
    setLote(novoLote);
    if (novoLote) {
      await AsyncStorage.setItem('@lote', JSON.stringify(novoLote));
    } else {
      await AsyncStorage.removeItem('@lote');
    }
  }

  function calcularSemanasLote() {
    const loteAtual =
      listaLotes.find((l) => l.id === lote?.id) || lote;
    return calcSemanas(loteAtual);
  }

  return (
    <GeralContext.Provider
      value={{
        load,
        lote,
        setLote: salvarLote,
        listaLotes,
        producao,
        custoOvo,
        dadosRelogio,
        calcularTudo,
        calcularSemanasLote,
        formatarData,
      }}
    >
      {children}
    </GeralContext.Provider>
  );
}

export default GeralProvider;