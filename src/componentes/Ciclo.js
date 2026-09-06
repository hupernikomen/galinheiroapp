import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { GeralContext } from '../contexts/geral';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { db } from '../services/firebaseConnection/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDA_TOTAL_SEMANAS = 90;
const CHAVE_PADRAO = '@usarMarcosPadrao';
const TAMANHO = 230;
const INTERVALO_SLIDER_MS = 5000;
const DURACAO_RELOGIO_MS = 500;
const DURACAO_MARCO_MS = 1500;
const DELAY_INICIO_MS = 1500;

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

export default function Ciclo() {
  const { lote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();

  const [usarPadrao, setUsarPadrao] = useState(true);
  const [marcosBanco, setMarcosBanco] = useState([]);
  const [indiceMarco, setIndiceMarco] = useState(0);
  const [semanaTexto, setSemanaTexto] = useState(0);

  const listaRef = useRef(null);
  const indiceMarcoRef = useRef(0);
  const progressPonteiro = useRef(new Animated.Value(0)).current;
  // ângulo do marco focado (0 → 360)
  const anguloMarcoAnim = useRef(new Animated.Value(0)).current;

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

  function semanaParaAngulo(semana) {
    const s = Math.min(Math.max(Number(semana) || 0, 0), VIDA_TOTAL_SEMANAS);
    return (s / VIDA_TOTAL_SEMANAS) * 360;
  }

  const semanas = calcularSemanas();
  const faseAtual = obterFaseAtual(semanas);
  const marcoFocado = marcos[indiceMarco] || null;
  const anguloFinalPonteiro =
    (Math.min(Math.max(semanas, 0), VIDA_TOTAL_SEMANAS) / VIDA_TOTAL_SEMANAS) *
    360;

  // Ponteiro: só a idade real do lote (fica parado depois da animação inicial)
  useEffect(() => {
    progressPonteiro.setValue(0);
    setSemanaTexto(0);

    if (semanas <= 0) return;

    let contadorId = null;

    const timeout = setTimeout(() => {
      Animated.timing(progressPonteiro, {
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
      progressPonteiro.stopAnimation();
    };
  }, [semanas, lote?.id]);

  // Marco focado: desliza no círculo quando o carrossel muda
  useEffect(() => {
    if (!marcoFocado) return;

    const anguloAlvo = semanaParaAngulo(marcoFocado.semana);

    Animated.timing(anguloMarcoAnim, {
      toValue: anguloAlvo,
      duration: DURACAO_MARCO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indiceMarco, marcoFocado?.semana, lote?.id]);

  // Índice inicial do carrossel
  useEffect(() => {
    if (!marcos.length) return;
    const idx = marcos.findIndex((m) => m.semana > semanas);
    const inicial = idx >= 0 ? idx : marcos.length - 1;
    setIndiceMarco(inicial);
    indiceMarcoRef.current = inicial;

    // posiciona o marco animado sem “pulo” estranho na primeira vez
    if (marcos[inicial]) {
      anguloMarcoAnim.setValue(semanaParaAngulo(marcos[inicial].semana));
    }

    setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({ index: inicial, animated: false });
      } catch (e) {}
    }, 100);
  }, [marcos.length, lote?.id, semanas]);

  // Autoplay carrossel
  useEffect(() => {
    if (marcos.length <= 1) return;

    const id = setInterval(() => {
      const proximo = (indiceMarcoRef.current + 1) % marcos.length;
      indiceMarcoRef.current = proximo;
      setIndiceMarco(proximo);
      try {
        listaRef.current?.scrollToIndex({ index: proximo, animated: true });
      } catch (e) {}
    }, INTERVALO_SLIDER_MS);

    return () => clearInterval(id);
  }, [marcos.length, lote?.id]);

  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i + 1);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcos.length) {
      setIndiceMarco(idx);
      indiceMarcoRef.current = idx;
    }
  }

  const spinPonteiro = progressPonteiro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${anguloFinalPonteiro}deg`],
  });

  const spinPonteiroInverso = progressPonteiro.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `-${anguloFinalPonteiro}deg`],
  });

  const spinMarcoFocado = anguloMarcoAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  function opacityDoTraco(semana) {
    return semana > 0 && semana <= semanas ? 1 : 0;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.relogio, { width: TAMANHO, height: TAMANHO }]}>
        {/* Traços */}
        {tracos.map((semana) => {
          const anguloTraco = (semana / VIDA_TOTAL_SEMANAS) * 360;
          const isTransicao = FASES.some((f) => f.inicio === semana);
          const passado = opacityDoTraco(semana) === 1;

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
                  {
                    backgroundColor: passado ? colors.principal : colors.neutro,
                  },
                  // isTransicao && styles.tracoFaseBase,
                ]}
              />
            </View>
          );
        })}

        {/* Marcos fixos (todos, discretos) */}
        {marcos
          .filter((m) => m.semana > 0 && m.semana <= VIDA_TOTAL_SEMANAS)
          .map((marco) => {
            const anguloMarco = (marco.semana / VIDA_TOTAL_SEMANAS) * 360;
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
                <View style={styles.marco} />
              </View>
            );
          })}

        {/* Marco focado — único que desliza */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.marcoContainer,
            {
              width: TAMANHO,
              height: TAMANHO,
              zIndex: 6,
              transform: [{ rotate: spinMarcoFocado }],
            },
          ]}
        >
          <View style={[styles.marcoFocado, {backgroundColor:colors.destaque}]} />
        </Animated.View>

        {/* Ponteiro = idade do lote (parado na posição final) */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.bolinhaContainer,
            {
              width: TAMANHO,
              height: TAMANHO,
              transform: [{ rotate: spinPonteiro }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.bolinha,
              {
                backgroundColor: colors.neutro,
                transform: [{ rotate: spinPonteiroInverso }],
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
              gap: 14,
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
            onScrollToIndexFailed={() => {}}
            style={[styles.listaMarcos, { width: TAMANHO }]}
            getItemLayout={(_, index) => ({
              length: TAMANHO,
              offset: TAMANHO * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width: TAMANHO }]}>
                <View style={styles.linhaSemana}>
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
    marginBottom: 60,
  },
  tracoContainer: {
    position: 'absolute',
    zIndex: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  traco: {
    position: 'absolute',
    top: -1,
    width: 1.5,
    height: 4,
    borderRadius: 1,
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
    width: 3,
    height: 14,
    borderRadius: 4,
    marginTop: -12,
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
    marginTop: -48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSemanas: {
    fontFamily: 'Roboto-Medium',
    color: '#000',
    fontSize:13
  },
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
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