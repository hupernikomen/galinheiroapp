import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { GeralContext } from '../../contexts/geral';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDA_TOTAL_SEMANAS = 90.1;
const CHAVE_PADRAO = '@usarMarcosPadrao';
const TAMANHO = 220;
const INTERVALO_SLIDER_MS = 3000;
const DURACAO_RELOGIO_MS = 500;
const DELAY_INICIO_MS = 2000;

const MARCOS_PADRAO = [
  { semana: 1, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

const FASES = [
  { nome: 'Cria', inicio: 1, fim: 8 },
  { nome: 'Recria', inicio: 9, fim: 17 },
  { nome: 'Pré-postura', inicio: 18, fim: 19 },
  { nome: 'Postura', inicio: 20, fim: 90 },
];

export default function RelogioProducao() {
  const { lote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();

  const [usarPadrao, setUsarPadrao] = useState(true);
  const [marcosBanco, setMarcosBanco] = useState([]);
  const [indiceMarco, setIndiceMarco] = useState(0);
  const [semanaTexto, setSemanaTexto] = useState(0);

  const listaRef = useRef(null);
  const indiceMarcoRef = useRef(0);
  const progressNative = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(CHAVE_PADRAO).then((res) => {
        if (res !== null) setUsarPadrao(res === 'true');
      });
    }, [])
  );

  // Marcos só do usuário logado
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

  // Animação bolinha + traços + contador
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

  // Índice inicial do carrossel
  useEffect(() => {
    if (!marcos.length) return;
    const idx = marcos.findIndex((m) => m.semana > semanas);
    const inicial = idx >= 0 ? idx : marcos.length - 1;
    setIndiceMarco(inicial);
    indiceMarcoRef.current = inicial;
    setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({ index: inicial, animated: false });
      } catch (e) { }
    }, 100);
  }, [marcos.length, lote?.id]);

  // Autoplay carrossel
  useEffect(() => {
    if (marcos.length <= 1) return;

    const id = setInterval(() => {
      const proximo = (indiceMarcoRef.current + 1) % marcos.length;
      indiceMarcoRef.current = proximo;
      setIndiceMarco(proximo);
      try {
        listaRef.current?.scrollToIndex({ index: proximo, animated: true });
      } catch (e) { }
    }, INTERVALO_SLIDER_MS);

    return () => clearInterval(id);
  }, [marcos.length, lote?.id]);

  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcos.length) {
      setIndiceMarco(idx);
      indiceMarcoRef.current = idx;
    }
  }

  const spin = progressNative.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${anguloFinal}deg`],
  });

  const spinInverse = progressNative.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `-${anguloFinal}deg`],
  });

  function opacityDoTraco(semana) {
    if (semanas <= 0) {
      return progressNative.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
      });
    }
    const t = semana / semanas;
    const falha = 0.5 / semanas;
    return progressNative.interpolate({
      inputRange: [Math.max(0, t - falha), Math.min(1, t)],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        {/* Traços */}
        {tracos.map((semana) => {
          const anguloTraco = (semana / VIDA_TOTAL_SEMANAS) * 360;
          const isTransicao = semanasTransicao.includes(semana);
          const podeAnimar = semana > 0 && semana <= semanas;

          return (
            <View
              key={semana}
              pointerEvents="box-none"
              style={[
                styles.tracoContainer,
                {
                  width: TAMANHO,
                  height: TAMANHO,
                  transform: [{ rotate: `${anguloTraco}deg` }],
                },
              ]}
            >
              <View
                style={[
                  styles.traco,
                  { backgroundColor: colors.neutro },
                  isTransicao && styles.tracoFaseBase,
                ]}
              />
              {podeAnimar && (
                <Animated.View
                  style={[
                    styles.traco,
                    styles.tracoPassado,
                    {
                      backgroundColor: colors.principal,
                      opacity: opacityDoTraco(semana),
                    },
                  ]}
                />
              )}
            </View>
          );
        })}

        {/* Pontos dos marcos */}
        {marcos
          .filter((m) => m.semana > 0 && m.semana < VIDA_TOTAL_SEMANAS)
          .map((marco) => {
            const anguloMarco = (marco.semana / VIDA_TOTAL_SEMANAS) * 360;
            const isFoco = marco.semana === semanaFoco;
            return (
              <View
                key={`marco-${marco.semana}-${marco.mensagem}`}
                pointerEvents="box-none"
                style={[
                  styles.marcoContainer,
                  {
                    width: TAMANHO,
                    height: TAMANHO,
                    transform: [{ rotate: `${anguloMarco}deg` }],
                  },
                ]}
              >
                <View style={[styles.marco, isFoco && styles.marcoFocado]} />
              </View>
            );
          })}

        {/* Ponteiro */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.bolinhaContainer,
            { width: TAMANHO, height: TAMANHO, transform: [{ rotate: spin }] },
          ]}
        >
          <Animated.View
            style={[
              styles.bolinha,
              {
                backgroundColor: colors.neutro,
                transform: [{ rotate: spinInverse }],
              },
            ]}
          >
            <Text style={styles.textoSemanas}>{semanaTexto}s</Text>
          </Animated.View>
        </Animated.View>

        {/* Centro */}
        <View
          style={[
            styles.ciclo,
            {
              width: TAMANHO,
              height: TAMANHO,
              borderRadius: TAMANHO / 2,
              backgroundColor: colors.principal,
            },
          ]}
        >
          {!!faseAtual && <Text style={styles.fase}>{faseAtual}</Text>}

          <FlatList
            ref={listaRef}
            data={marcos}
            keyExtractor={(item, i) => `${item.semana}-${item.mensagem}-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollMarcos}
            onScrollToIndexFailed={() => { }}
            style={[styles.listaMarcos, { width: TAMANHO }]}
            getItemLayout={(_, index) => ({
              length: TAMANHO,
              offset: TAMANHO * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: TAMANHO }]}>
                <View style={styles.linhaSemana}>
                  <View style={styles.bolinhaProximoMsg} />
                  <Text style={styles.mensagem}>Semana {item.semana}</Text>
                </View>
                <Text style={styles.mensagem} numberOfLines={3}>
                  {item.mensagem}
                </Text>
              </View>
            )}
          />

          <View style={styles.dots}>
            {marcos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === indiceMarco && styles.dotAtivo]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    alignItems: 'center',
  },
  relogio: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  tracoContainer: {
    position: 'absolute',
    zIndex: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  traco: {
    position: 'absolute',
    top: -5,
    width: 1.5,
    height: 8,
    borderRadius: 1,
  },
  tracoPassado: {
    width: 2,
  },

  marcoContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 3,
  },
  marco: {
    width: 3,
    height: 5,
    borderRadius: 6,
    backgroundColor: '#22222235',
    marginTop: -12,
  },
  marcoFocado: {
    backgroundColor: '#f39c12',
    width: 3,
    height: 10,
    marginTop: -15,
  },
  bolinhaContainer: {
    position: 'absolute',
    zIndex: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    width: 30,
    aspectRatio: 1,
    borderRadius: 20,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSemanas: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
    fontWeight: 'bold',
  },
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
    paddingTop: 20,
    paddingBottom: 8,
  },
  fase: {
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
  },
  listaMarcos: {
    maxHeight: 70,
    flexGrow: 0,
  },
  slide: {
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaSemana: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bolinhaProximoMsg: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#f39c12',
  },
  mensagem: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotAtivo: {
    backgroundColor: '#fff',
    width: 8,
  },
});