import { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  TAMANHO,
  VIDA_TOTAL_SEMANAS,
  DURACAO_MARCO_MS,
  semanaParaAngulo,
} from '../constants/ciclo';

export default function CicloCirculo({ semanas = 0, marcos = [], loteId }) {
  const { colors } = useTheme();

  const [indiceMarco, setIndiceMarco] = useState(0);
  const listaRef = useRef(null);
  const anguloPonteiroAnim = useRef(
    new Animated.Value(semanaParaAngulo(semanas || 1))
  ).current;

  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i + 1);

  // Índice do próximo evento futuro (destaque especial no dot)
  const indiceProximo = useMemo(() => {
    if (!marcos.length) return -1;
    const idx = marcos.findIndex((m) => Number(m.semana) > semanas);
    return idx >= 0 ? idx : marcos.length - 1;
  }, [marcos, semanas]);

  // Ponteiro só na semana atual
  useEffect(() => {
    const semanaAlvo = Math.min(Math.max(semanas || 1, 1), VIDA_TOTAL_SEMANAS);
    Animated.timing(anguloPonteiroAnim, {
      toValue: semanaParaAngulo(semanaAlvo),
      duration: DURACAO_MARCO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [semanas, loteId]);

  // Abre no próximo evento futuro
  useEffect(() => {
    if (!marcos.length || indiceProximo < 0) return;

    setIndiceMarco(indiceProximo);

    setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({
          index: indiceProximo,
          animated: false,
        });
      } catch (e) {}
    }, 80);
  }, [marcos.length, loteId, indiceProximo]);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcos.length) {
      setIndiceMarco(idx);
    }
  }

  const spinPonteiro = anguloPonteiroAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}>
      {tracos.map((semana) => {
        const anguloTraco = (semana / VIDA_TOTAL_SEMANAS) * 360;
        const passado = semana > 0 && semana <= semanas;

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
              ]}
            />
          </View>
        );
      })}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.marcoContainer,
          {
            width: TAMANHO,
            height: TAMANHO,
            transform: [{ rotate: spinPonteiro }],
          },
        ]}
      >
        <View
          style={[styles.marcoFocado, { backgroundColor: colors.principal }]}
        />
      </Animated.View>

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
        {marcos.length === 0 ? (
          <Text style={styles.mensagem}>Sem marcos</Text>
        ) : (
          <>
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
                  {!!item.titulo && (
                    <Text style={styles.titulo}>{item.titulo}</Text>
                  )}
                  <Text style={styles.mensagem}>
                    Na semana {String(item.semana).split('.')[0]}
                  </Text>
                  <Text style={styles.mensagem} numberOfLines={3}>
                    {item.mensagem}
                  </Text>
                </View>
              )}
            />

            <View style={styles.dots}>
              {marcos.map((m, i) => {
                const ativo = i === indiceMarco;
                const ehProximo = i === indiceProximo;

                
              })}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camada: {
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 1,
    height: 7,
    borderRadius: 1,
  },
  marcoContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 6,
  },
  marcoFocado: {
    width: 1.8,
    height: 25,
    marginTop: -20,
    marginLeft: 1.5,
  },
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  listaMarcos: {
    flexGrow: 0,
    maxHeight: 90,
  },
  slide: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  mensagem: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
  },
});