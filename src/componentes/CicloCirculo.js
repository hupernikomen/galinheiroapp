import { useEffect, useRef, useState } from 'react';
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
  DIAS_TOTAL,
  DURACAO_PONTEIRO_MS,
  INTERVALO_SLIDER_MS,
  diaParaAngulo,
} from '../constants/ciclo';

export default function CicloCirculo({
  dias = 0,
  semanas = 0,
  marcosDaSemana = [],
  loteId,
}) {
  const { colors } = useTheme();
  const [indiceMarco, setIndiceMarco] = useState(0);
  const listaRef = useRef(null);

  const anguloPonteiroAnim = useRef(
    new Animated.Value(diaParaAngulo(dias || 1))
  ).current;

  // Traços = dias (630). Em aparelhos fracos, se pesar, troque o passo para 1 a cada 2 dias.
  const tracos = Array.from({ length: DIAS_TOTAL }, (_, i) => i + 1);

  // Ponteiro acompanha o dia
  useEffect(() => {
    const diaAlvo = Math.min(Math.max(dias || 1, 1), DIAS_TOTAL);
    Animated.timing(anguloPonteiroAnim, {
      toValue: diaParaAngulo(diaAlvo),
      duration: DURACAO_PONTEIRO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [dias, loteId]);

  // Slide automático só com os marcos da semana atual
  useEffect(() => {
    setIndiceMarco(0);
    if (marcosDaSemana.length <= 1) return;

    const id = setInterval(() => {
      setIndiceMarco((prev) => {
        const next = (prev + 1) % marcosDaSemana.length;
        try {
          listaRef.current?.scrollToIndex({ index: next, animated: true });
        } catch (e) {}
        return next;
      });
    }, INTERVALO_SLIDER_MS);

    return () => clearInterval(id);
  }, [marcosDaSemana, loteId, semanas]);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcosDaSemana.length) {
      setIndiceMarco(idx);
    }
  }

  const spinPonteiro = anguloPonteiroAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}>
      {tracos.map((dia) => {
        const anguloTraco = diaParaAngulo(dia);
        const passado = dia <= dias;
        const inicioSemana = (dia - 1) % 7 === 0; // traço um pouco maior a cada semana

        return (
          <View
            key={dia}
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
                  height: inicioSemana ? 10 : 5,
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
        <Text style={styles.legendaDia}>
          Dia {dias || 0}
          {semanas > 0 ? `  ·  Semana ${semanas}` : ''}
        </Text>

        {marcosDaSemana.length === 0 ? (
          <Text style={styles.mensagem}>Sem eventos nesta semana</Text>
        ) : (
          <>
            <FlatList
              ref={listaRef}
              data={marcosDaSemana}
              keyExtractor={(item, i) =>
                `${item.id || i}-${item.semana}-${item.mensagem}`
              }
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
                  <Text style={styles.mensagem} numberOfLines={4}>
                    {item.mensagem}
                  </Text>
                </View>
              )}
            />

            {marcosDaSemana.length > 1 && (
              <View style={styles.dots}>
                {marcosDaSemana.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === indiceMarco && styles.dotAtivo,
                    ]}
                  />
                ))}
              </View>
            )}
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
    borderRadius: 1,
  },
  marcoContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 6,
  },
  marcoFocado: {
    width: 2,
    height: 22,
    marginTop: -18,
  },
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
    paddingBottom: 10,
    paddingTop: 12,
  },
  legendaDia: {
    fontFamily: 'Roboto-Medium',
    fontSize: 13,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  listaMarcos: {
    flexGrow: 0,
    maxHeight: 78,
  },
  slide: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  mensagem: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 12,
    color: '#fff',
    lineHeight: 17,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
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