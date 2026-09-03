import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { GeralContext } from '../../contexts/geral';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RelogioTracos from './RelogioTracos';
import RelogioPonteiro from './RelogioPonteiro';
import RelogioMarcosPontos from './RelogioMarcosPontos';
import RelogioCentro from './RelogioCentro';

const VIDA_TOTAL_SEMANAS = 91;
const CHAVE_PADRAO = '@usarMarcosPadrao';
const TAMANHO = 220;
const INTERVALO_SLIDER_MS = 5000;
const DURACAO_RELOGIO_MS = 500;
const DELAY_INICIO_MS = 2000;

const MARCOS_PADRAO = [
  { semana: 1, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

const FASES = [
  { nome: 'Cria', inicio: 0, fim: 8 },
  { nome: 'Recria', inicio: 9, fim: 17 },
  { nome: 'Pré-postura', inicio: 18, fim: 19 },
  { nome: 'Postura', inicio: 20, fim: 90 },
];

export default function RelogioProducao() {
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();

  const [usarPadrao, setUsarPadrao] = useState(true);
  const [marcosBanco, setMarcosBanco] = useState([]);
  const [indiceMarco, setIndiceMarco] = useState(0);
  const [semanaTexto, setSemanaTexto] = useState(0);

  const progressNative = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_PADRAO).then((res) => {
        if (res !== null) setUsarPadrao(res === 'true');
      });
    }, [])
  );

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'marcos'), (snapshot) => {
      const dados = snapshot.docs.map((d) => ({
        id: d.id,
        semana: Number(d.data().semana) || 0,
        mensagem: d.data().mensagem || '',
      }));
      setMarcosBanco(dados);
    });
    return () => unsub();
  }, []);

  const marcos = (() => {
    const mapa = new Map();
    if (usarPadrao) {
      MARCOS_PADRAO.forEach((m) => mapa.set(m.semana, { ...m }));
    }
    marcosBanco.forEach((m) => mapa.set(m.semana, m));
    return Array.from(mapa.values()).sort((a, b) => a.semana - b.semana);
  })();

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

  function obterFaseAtual(semanas) {
    const fase = FASES.find((f) => semanas >= f.inicio && semanas <= f.fim);
    return fase ? fase.nome : '';
  }

  const semanasTransicao = FASES.map((f) => f.inicio).filter((s) => s > 0);
  const semanas = calcularSemanas();
  const faseAtual = obterFaseAtual(semanas);
  const marcoFocado = marcos[indiceMarco] || null;
  const semanaFoco = marcoFocado?.semana;
  const anguloFinal =
    (Math.min(Math.max(semanas, 0), VIDA_TOTAL_SEMANAS) / VIDA_TOTAL_SEMANAS) *
    360;

  // Animação: delay → bolinha + traços + contador
  useEffect(() => {
    progressNative.setValue(0);
    setSemanaTexto(0);

    if (semanas <= 0) return;

    let contadorId = null;

    const timeout = setTimeout(() => {
      Animated.timing(progressNative, {
        toValue: 1,
        duration: DURACAO_RELOGIO_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      if (semanas <= 1) {
        setSemanaTexto(semanas);
        return;
      }

      const passoMs = DURACAO_RELOGIO_MS / semanas;
      let atual = 0;
      contadorId = setInterval(() => {
        atual += 1;
        setSemanaTexto(Math.min(atual, semanas));
        if (atual >= semanas) clearInterval(contadorId);
      }, passoMs);
    }, DELAY_INICIO_MS);

    return () => {
      clearTimeout(timeout);
      if (contadorId) clearInterval(contadorId);
      progressNative.stopAnimation();
    };
  }, [semanas, lote?.id]);

  // Índice inicial do carrossel (próximo marco)
  useEffect(() => {
    if (!marcos.length) return;
    const idx = marcos.findIndex((m) => m.semana > semanas);
    const inicial = idx >= 0 ? idx : marcos.length - 1;
    setIndiceMarco(inicial);
  }, [marcos.length, lote?.id]);

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        <RelogioTracos
          tamanho={TAMANHO}
          semanas={semanas}
          progressNative={progressNative}
          corNeutra={colors.neutro}
          corPrincipal={colors.principal}
          semanasTransicao={semanasTransicao}
        />

        <RelogioMarcosPontos
          tamanho={TAMANHO}
          marcos={marcos}
          semanaFoco={semanaFoco}
        />

        <RelogioPonteiro
          tamanho={TAMANHO}
          progressNative={progressNative}
          anguloFinal={anguloFinal}
          semanaTexto={semanaTexto}
          corFundo={colors.neutro}
        />

        <RelogioCentro
          tamanho={TAMANHO}
          corPrincipal={colors.principal}
          faseAtual={faseAtual}
          marcos={marcos}
          indiceMarco={indiceMarco}
          onChangeIndice={setIndiceMarco}
          autoPlayMs={INTERVALO_SLIDER_MS}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    alignItems: 'center',
  },
  relogio: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
});