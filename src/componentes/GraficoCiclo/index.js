import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { GeralContext } from '../../contexts/geral';
import { useNavigation, useTheme, useFocusEffect } from '@react-navigation/native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDA_TOTAL_SEMANAS = 90;
const CHAVE_PADRAO = '@usarMarcosPadrao';
const TAMANHO = 220;

const MARCOS_PADRAO = [
  { semana: 0, mensagem: 'Início do lote' },
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
  const navigation = useNavigation();
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();

  const [usarPadrao, setUsarPadrao] = useState(true);
  const [marcosBanco, setMarcosBanco] = useState([]);
  const [indiceMarco, setIndiceMarco] = useState(0);
  const listaRef = useRef(null);

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
  const progresso = Math.min(semanas / VIDA_TOTAL_SEMANAS, 1);
  const angulo = progresso * 360;
  const faseAtual = obterFaseAtual(semanas);

  const marcoFocado = marcos[indiceMarco] || null;
  const semanaFoco = marcoFocado?.semana;

  useEffect(() => {
    if (!marcos.length) return;
    const idx = marcos.findIndex((m) => m.semana > semanas);
    const inicial = idx >= 0 ? idx : marcos.length - 1;
    setIndiceMarco(inicial);
    setTimeout(() => {
      listaRef.current?.scrollToIndex({ index: inicial, animated: false });
    }, 100);
  }, [marcos.length, lote?.id]);

  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i);

  function abrirMarcos() {
    const root =
      navigation.getParent()?.getParent?.() ||
      navigation.getParent?.() ||
      navigation;
    root.navigate('Marcos');
  }

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcos.length && idx !== indiceMarco) {
      setIndiceMarco(idx);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.relogio}>
        {/* Traços */}
        {tracos.map((semana) => {
          const anguloTraco = (semana / VIDA_TOTAL_SEMANAS) * 360;
          const isPassado = semana <= semanas;
          const isTransicao = semanasTransicao.includes(semana);

          return (
            <View
              key={semana}
              pointerEvents="box-none"
              style={[
                styles.tracoContainer,
                { transform: [{ rotate: `${anguloTraco}deg` }] },
              ]}
            >
             // no map dos traços — ordem dos estilos importa
              <View
                style={[
                  styles.traco,
                  { backgroundColor: colors.neutro },
                  isPassado && [
                    styles.tracoPassado,
                    { backgroundColor: colors.principal },
                  ],
                  isTransicao && styles.tracoFase,
                  isTransicao && isPassado && styles.tracoFasePassado,
                ]}
              />
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
                  { transform: [{ rotate: `${anguloMarco}deg` }] },
                ]}
              >
                <View style={[styles.marco, isFoco && styles.marcoFocado]} />
              </View>
            );
          })}

        {/* Bolinha da idade */}
        <View
          pointerEvents="box-none"
          style={[
            styles.bolinhaContainer,
            { transform: [{ rotate: `${angulo}deg` }] },
          ]}
        >
          <View
            style={[
              styles.bolinha,
              {
                backgroundColor: colors.neutro,
                transform: [{ rotate: `-${angulo}deg` }],
              },
            ]}
          >
            <Text style={styles.textoSemanas}>{semanas}s</Text>
          </View>
        </View>

        {/* Centro */}
        <View style={[styles.ciclo, { backgroundColor: colors.principal }]}>
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
            style={styles.listaMarcos}
            getItemLayout={(_, index) => ({
              length: TAMANHO,
              offset: TAMANHO * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.slide}>
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

          <Pressable onPress={abrirMarcos} style={styles.botaoMais} hitSlop={16}>
            <Text style={styles.botaoMaisTexto}>+</Text>
          </Pressable>
        </View>
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
    width: TAMANHO,
    height: TAMANHO,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  tracoContainer: {
    position: 'absolute',
    zIndex: 15,
    width: TAMANHO,
    height: TAMANHO,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  traco: {
    width: 1.5,
    height: 8,
    marginTop: -6,
    borderRadius: 1,
  },
  tracoPassado: {
    width: 3.5,
  },
  tracoFase: {
    width: 1,
    height: 14,
    marginTop: -1,
    backgroundColor: '#fff', // visível no fundo branco
    borderRadius: 1,
  },
  tracoFasePassado: {
    backgroundColor: '#f5dd08',
    width: 3,
    height: 16,
    marginTop: -10,
  },
  marcoContainer: {
    position: 'absolute',
    width: TAMANHO,
    height: TAMANHO,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 3,
  },
  marco: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#22222235',
    marginTop: -15,
  },
  marcoFocado: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#f39c12',
    marginTop: -18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bolinhaContainer: {
    position: 'absolute',
    zIndex: 4,
    width: TAMANHO,
    height: TAMANHO,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    width: 35,
    aspectRatio: 1,
    borderRadius: 20,
    marginTop: -55,
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
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: TAMANHO / 2,
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
    width: TAMANHO,
    maxHeight: 70,
    flexGrow: 0,
  },
  slide: {
    width: TAMANHO,
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
  botaoMais: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    zIndex: 20,
  },
  botaoMaisTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
});