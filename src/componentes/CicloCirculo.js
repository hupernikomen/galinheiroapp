import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  TAMANHO,
  DIAS_TOTAL,
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

  const diaAlvo = Math.min(Math.max(dias || 1, 1), DIAS_TOTAL);
  const anguloPonteiro = diaParaAngulo(diaAlvo);

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

  return (
    <View style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}>
      <View
        style={[
          styles.ciclo,
          {
            width: TAMANHO,
            height: TAMANHO,
            borderRadius: TAMANHO / 2,
            backgroundColor: colors.principal,
            borderWidth:5,
            borderColor:colors.neutro
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
        )}
        
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.marcoContainer,
          {
            width: TAMANHO,
            height: TAMANHO,
            transform: [{ rotate: `${anguloPonteiro}deg` }],
          },
        ]}
      >
        <View
          style={[styles.marcoFocado, { borderBottomColor: colors.destaque,  }]}
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
  marcoContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 6,
  },
  marcoFocado: {
    marginTop: -10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
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
    paddingHorizontal: 20,
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
});