import { useState, useEffect, createContext, useContext } from 'react';
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
import { AuthContext } from './AuthContext';

export const AppContext = createContext({});

function AppProvider({ children }) {
  const { uid } = useContext(AuthContext);

  const [load, setLoad] = useState(false);
  const [lote, setLote] = useState(null);
  const [listaLotes, setListaLotes] = useState([]);
  const [producao, setProducao] = useState(0);
  const [custoOvo, setCustoOvo] = useState(null);
  const [dadosRelogio, setDadosRelogio] = useState({
    totalOvosProduzidos: 0,
    producaoTotalEstimada: 0,
  });
  const [appPronto, setAppPronto] = useState(false);

  useEffect(() => {
    if (!uid) {
      setListaLotes([]);
      setLote(null);
      setProducao(0);
      setCustoOvo(null);
      setDadosRelogio({ totalOvosProduzidos: 0, producaoTotalEstimada: 0 });
      setAppPronto(true);
      return;
    }

    let cancelado = false;
    setAppPronto(false);

    const q = query(collection(db, 'lotes'), where('userId', '==', uid));

    const unsubLotes = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setListaLotes(dados);
      },
      (error) => console.log('Erro lotes:', error)
    );

    AsyncStorage.getItem('@lote')
      .then((res) => {
        if (cancelado || !res) return;
        try {
          const salvo = JSON.parse(res);
          if (!salvo?.userId || salvo.userId === uid) {
            setLote(salvo);
          } else {
            setLote(null);
            AsyncStorage.removeItem('@lote');
          }
        } catch (e) {
          console.log(e);
        }
      })
      .finally(() => {
        if (!cancelado) setTimeout(() => setAppPronto(true), 300);
      });

    return () => {
      cancelado = true;
      unsubLotes();
    };
  }, [uid]);

  useEffect(() => {
    if (!lote?.id || !uid) {
      setProducao(0);
      setCustoOvo(null);
      setDadosRelogio({ totalOvosProduzidos: 0, producaoTotalEstimada: 0 });
      return;
    }

    const qOvos = query(
      collection(db, 'coletaOvos'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    );
    const qCustos = query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    );
    const qInv = query(
      collection(db, 'investimentos'),
      where('userId', '==', uid)
    );

    const unsubOvos = onSnapshot(qOvos, () => calcularTudo());
    const unsubCustos = onSnapshot(qCustos, () => calcularTudo());
    const unsubInv = onSnapshot(qInv, () => calcularTudo(), (e) => {
      // se ainda não há userId em investimentos, não quebra o app
      console.log('Investimentos:', e?.message);
    });

    calcularTudo();

    return () => {
      unsubOvos();
      unsubCustos();
      unsubInv();
    };
  }, [lote?.id, uid]);

  async function calcularTudo() {
    if (!lote?.id) return;

    setLoad(true);
    try {
      const loteAtual = listaLotes.find((l) => l.id === lote.id) || lote;
      const resultado = await calcularTudoDoLote(loteAtual, uid);

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
    const loteAtual = listaLotes.find((l) => l.id === lote?.id) || lote;
    return calcSemanas(loteAtual);
  }

  return (
    <AppContext.Provider
      value={{
        appPronto,
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
    </AppContext.Provider>
  );
}

export default AppProvider;