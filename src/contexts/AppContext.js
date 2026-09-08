import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebaseConnection/firebase';
import { calcularTudoDoLote } from '../services/calculosLote';
import { AuthContext } from './AuthContext';

export const AppContext = createContext({});

function AppProvider({ children }) {
  const { uid } = useContext(AuthContext);

  const [lote, setLote] = useState(null);
  const [listaLotes, setListaLotes] = useState([]);
  const [custoOvo, setCustoOvo] = useState(null);
  const [appPronto, setAppPronto] = useState(false);

  useEffect(() => {
    if (!uid) {
      setListaLotes([]);
      setLote(null);
      setCustoOvo(null);
      setAppPronto(true);
      return;
    }

    let cancelado = false;
    setAppPronto(false);

    const q = query(collection(db, 'lotes'), where('userId', '==', uid));
    const unsubLotes = onSnapshot(q, (snapshot) => {
      setListaLotes(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

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
      setCustoOvo(null);
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
    const qRacao = query(
      collection(db, 'distribuicaoRacao'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    );
    const qCartelas = query(
      collection(db, 'cartelas'),
      where('loteId', '==', lote.id),
      where('userId', '==', uid)
    );
    const qInv = query(
      collection(db, 'investimentos'),
      where('userId', '==', uid)
    );

    const recalcular = () => calcularTudo();

    const unsubOvos = onSnapshot(qOvos, recalcular);
    const unsubCustos = onSnapshot(qCustos, recalcular);
    const unsubRacao = onSnapshot(qRacao, recalcular);
    const unsubCartelas = onSnapshot(qCartelas, recalcular);
    const unsubInv = onSnapshot(qInv, recalcular, (e) => {
      console.log('Investimentos:', e?.message);
    });

    calcularTudo();

    return () => {
      unsubOvos();
      unsubCustos();
      unsubRacao();
      unsubCartelas();
      unsubInv();
    };
  }, [lote?.id, uid, listaLotes]);

  async function calcularTudo() {
    if (!lote?.id || !uid) return;

    try {
      const loteAtual = listaLotes.find((l) => l.id === lote.id) || lote;
      const resultado = await calcularTudoDoLote(loteAtual, uid);
      setCustoOvo(resultado.custoOvo);
    } catch (error) {
      console.log('Erro ao calcular:', error);
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

  return (
    <AppContext.Provider
      value={{
        appPronto,
        lote,
        setLote: salvarLote,
        listaLotes,
        custoOvo,
        calcularTudo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;