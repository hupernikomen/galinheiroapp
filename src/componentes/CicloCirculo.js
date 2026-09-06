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
  VIDA_TOTAL_SEMANAS,
  INTERVALO_SLIDER_MS,
  DURACAO_MARCO_MS,
  semanaParaAngulo,
} from '../constants/ciclo';

export default function CicloCirculo({ semanas = 0, marcos = [], loteId }) {
  const { colors } = useTheme();

  const [indiceMarco, setIndiceMarco] = useState(0);
  const listaRef = useRef(null);
  const indiceMarcoRef = useRef(0);
  const anguloMarcoAnim = useRef(new Animated.Value(0)).current;

  const marcoFocado = marcos[indiceMarco] || null;
  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i + 1);

  useEffect(() => {
    if (!marcoFocado) return;

    Animated.timing(anguloMarcoAnim, {
      toValue: semanaParaAngulo(marcoFocado.semana),
      duration: DURACAO_MARCO_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indiceMarco, marcoFocado?.semana, loteId]);

  useEffect(() => {
    if (!marcos.length) return;

    const idx = marcos.findIndex((m) => m.semana > semanas);
    const inicial = idx >= 0 ? idx : marcos.length - 1;
    setIndiceMarco(inicial);
    indiceMarcoRef.current = inicial;

    if (marcos[inicial]) {
      anguloMarcoAnim.setValue(semanaParaAngulo(marcos[inicial].semana));
    }

    setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({ index: inicial, animated: false });
      } catch (e) { }
    }, 100);
  }, [marcos.length, loteId, semanas]);

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
  }, [marcos.length, loteId]);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TAMANHO);
    if (idx >= 0 && idx < marcos.length) {
      setIndiceMarco(idx);
      indiceMarcoRef.current = idx;
    }
  }

  const spinMarcoFocado = anguloMarcoAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.camada,
        { width: TAMANHO, height: TAMANHO },
      ]}
    >
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
            transform: [{ rotate: spinMarcoFocado }],
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
            gap: 14,
          },
        ]}
      >
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
              {!!item.titulo ? <Text style={styles.titulo}>
                {item.titulo}
              </Text> : null}
              <View style={styles.linhaSemana}>
                <Text style={styles.mensagem}>
                  Na semana {String(item.semana).split('.')[0]}
                </Text>
              </View>
              <Text style={styles.mensagem} numberOfLines={3}>
                {item.mensagem}
              </Text>
            </View>
          )}
        />


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
    marginLeft: 1.5
  },
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
  },
  listaMarcos: {
    flexGrow: 0,
  },
  slide: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: "#fff",
    marginBottom: 14
  },
  mensagem: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 13,
    color: '#fff',
  },

});