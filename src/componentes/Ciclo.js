import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../services/firebaseConnection/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CicloMarcosBorda from './CicloMarcosBorda';
import CicloCirculo from './CicloCirculo';

import {
  TAMANHO,
  CHAVE_PADRAO,
  MARCOS_PADRAO,
  DIAS_TOTAL,
  diasParaSemana,
} from '../constants/ciclo';

function calcularDiasVida(lote) {
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
  if (dias < 0) return 0;
  return Math.min(dias + 1, DIAS_TOTAL); // dia 1 = dia da chegada
}

export default function Ciclo() {
  const { lote } = useContext(AppContext);
  const { uid } = useAuth();

  const [usarPadrao, setUsarPadrao] = useState(true);
  const [marcosBanco, setMarcosBanco] = useState([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_PADRAO).then((res) => {
        if (res !== null) setUsarPadrao(res === 'true');
      });
    }, [])
  );

  useEffect(() => {
    if (!uid) {
      setMarcosBanco([]);
      return;
    }

    const q = query(collection(db, 'marcos'), where('userId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          semana: Number(d.data().semana) || 0,
          mensagem: d.data().mensagem || '',
          titulo: d.data().titulo || '',
        }));
        setMarcosBanco(dados);
      },
      (error) => console.log('Erro marcos:', error)
    );

    return () => unsub();
  }, [uid]);

  const dias = calcularDiasVida(lote);
  const semanas = diasParaSemana(dias);

  // Todos os eventos (padrão + personalizados). Vários na mesma semana = ok.
  const todosMarcos = useMemo(() => {
    const lista = [];
    if (usarPadrao) {
      MARCOS_PADRAO.forEach((m, i) =>
        lista.push({ ...m, tipo: 'padrao', id: `padrao-${i}-${m.semana}` })
      );
    }
    marcosBanco.forEach((m) => lista.push({ ...m, tipo: 'personalizado' }));
    return lista.sort((a, b) => a.semana - b.semana || String(a.id).localeCompare(String(b.id)));
  }, [usarPadrao, marcosBanco]);

  // Semanas únicas só para bolinhas na borda (sem sobrepor dois pontos no mesmo lugar)
  const semanasNaBorda = useMemo(() => {
    const set = new Set();
    todosMarcos.forEach((m) => {
      const s = Number(m.semana);
      if (s > 0) set.add(s);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [todosMarcos]);

  const semanaDestaque = useMemo(() => {
    // destaca o marco da semana em que o lote está agora
    if (semanasNaBorda.some((s) => Number(s) === Number(semanas))) {
      return semanas;
    }
    return null; // se não houver marco nesta semana, nada em destaque
  }, [semanasNaBorda, semanas]);

  // Marcos da semana atual (slide automático no centro)
  const marcosDaSemanaAtual = useMemo(() => {
    return todosMarcos.filter((m) => Number(m.semana) === semanas);
  }, [todosMarcos, semanas]);

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        <CicloMarcosBorda
          semanas={semanasNaBorda}
          semanaDestaque={semanaDestaque}
        />
        <CicloCirculo
          dias={dias}
          semanas={semanas}
          marcosDaSemana={marcosDaSemanaAtual}
          loteId={lote?.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    alignItems: 'center',
  },
  relogio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});