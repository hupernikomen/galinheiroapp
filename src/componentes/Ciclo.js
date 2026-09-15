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

/** Converte semana → 1º dia da semana (1–7 → 1, 8–14 → 8, …) */
function diaDaSemana(semana) {
  const s = Number(semana) || 0;
  if (s <= 0) return 1;
  return (s - 1) * 7 + 1;
}

function normalizarMarco(m, origem, id) {
  const semana = Number(m.semana) || 0;
  let dia = Number(m.dia);
  if (!dia || dia < 1) {
    dia = diaDaSemana(semana);
  }
  return {
    ...m,
    id: id || m.id,
    dia,
    semana: semana || diasParaSemana(dia),
    mensagem: m.mensagem || '',
    titulo: m.titulo || '',
    tipo: origem,
  };
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
        const dados = snapshot.docs.map((d) => {
          const data = d.data();
          return normalizarMarco(
            {
              semana: data.semana,
              dia: data.dia,
              mensagem: data.mensagem,
              titulo: data.titulo,
            },
            'personalizado',
            d.id
          );
        });
        setMarcosBanco(dados);
      },
      (error) => console.log('Erro marcos:', error)
    );

    return () => unsub();
  }, [uid]);

  const dias = calcularDiasVida(lote);
  const semanas = diasParaSemana(dias);

  // Todos os eventos (padrão + personalizados), com dia definido
  const todosMarcos = useMemo(() => {
    const lista = [];

    if (usarPadrao) {
      MARCOS_PADRAO.forEach((m, i) => {
        lista.push(
          normalizarMarco(m, 'padrao', `padrao-${i}-${m.semana ?? m.dia}`)
        );
      });
    }

    marcosBanco.forEach((m) => lista.push(m));

    return lista.sort(
      (a, b) =>
        a.dia - b.dia ||
        a.semana - b.semana ||
        String(a.id).localeCompare(String(b.id))
    );
  }, [usarPadrao, marcosBanco]);

  // Dias únicos na borda (posição no círculo)
  const diasNaBorda = useMemo(() => {
    const set = new Set();
    todosMarcos.forEach((m) => {
      const d = Number(m.dia);
      if (d > 0 && d <= DIAS_TOTAL) set.add(d);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [todosMarcos]);

  // Destaque na borda só se existir marco neste dia
  const diaDestaque = useMemo(() => {
    if (diasNaBorda.some((d) => Number(d) === Number(dias))) {
      return dias;
    }
    return null;
  }, [diasNaBorda, dias]);

  // Slide do centro: APENAS marcos deste dia (não a semana inteira)
  const marcosDoDiaAtual = useMemo(() => {
    return todosMarcos.filter((m) => Number(m.dia) === Number(dias));
  }, [todosMarcos, dias]);

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        <CicloMarcosBorda
          dias={diasNaBorda}
          diaDestaque={diaDestaque}
          // compatível se o componente antigo ainda usar semanas:
          semanas={diasNaBorda.map((d) => diasParaSemana(d))}
          semanaDestaque={
            diaDestaque != null ? diasParaSemana(diaDestaque) : null
          }
        />
        <CicloCirculo
          dias={dias}
          semanas={semanas}
          marcosDoDia={marcosDoDiaAtual}
          marcosDaSemana={marcosDoDiaAtual}
          loteId={lote?.id}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 999,
    marginBottom: 35,
  },
  relogio: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});