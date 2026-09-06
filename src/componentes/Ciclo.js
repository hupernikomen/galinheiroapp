import { useContext, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppContext } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../services/firebaseConnection/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CicloMarcosPadrao from './CicloMarcosPadrao';
import CicloMarcosPersonalizados from './CicloMarcosPersonalizados';
import CicloCirculo from './CicloCirculo';

import {
  TAMANHO,
  CHAVE_PADRAO,
  MARCOS_PADRAO,
} from '../constants/ciclo';

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
        }));
        setMarcosBanco(dados);
      },
      (error) => console.log('Erro marcos:', error)
    );

    return () => unsub();
  }, [uid]);

  function calcularSemanas() {
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
    return dias <= 0 ? 1 : Math.ceil(dias / 7);
  }

  const semanas = calcularSemanas();

  const marcosCarrossel = (() => {
    const lista = [];
    if (usarPadrao) {
      MARCOS_PADRAO.forEach((m) => lista.push({ ...m, tipo: 'padrao' }));
    }
    marcosBanco.forEach((m) => lista.push({ ...m, tipo: 'personalizado' }));
    return lista.sort((a, b) => a.semana - b.semana);
  })();

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        {/* Fundo */}
        <CicloMarcosPadrao visivel={usarPadrao} />

        {/* Meio */}
        <CicloMarcosPersonalizados marcos={marcosBanco} />

        {/* Topo: traços, círculo, ponteiro focado */}
        <CicloCirculo
          semanas={semanas}
          marcos={marcosCarrossel}
          loteId={lote?.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    alignItems: 'center',
  },
  relogio: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
});