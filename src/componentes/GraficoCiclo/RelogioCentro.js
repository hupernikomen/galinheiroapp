import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function RelogioCentro({
  tamanho,
  corPrincipal,
  faseAtual,
  marcos = [],
  indiceMarco,
  onChangeIndice,
  autoPlayMs = 3000,
}) {
  const listaRef = useRef(null);
  const indiceRef = useRef(indiceMarco);

  useEffect(() => {
    indiceRef.current = indiceMarco;
  }, [indiceMarco]);

  // Posiciona no índice atual (ex.: ao mudar lote)
  useEffect(() => {
    if (!marcos.length) return;
    setTimeout(() => {
      try {
        listaRef.current?.scrollToIndex({
          index: indiceMarco,
          animated: false,
        });
      } catch (e) {}
    }, 80);
  }, [marcos.length, indiceMarco]);

  // Autoplay
  useEffect(() => {
    if (marcos.length <= 1) return;

    const id = setInterval(() => {
      const proximo = (indiceRef.current + 1) % marcos.length;
      indiceRef.current = proximo;
      onChangeIndice?.(proximo);
      try {
        listaRef.current?.scrollToIndex({ index: proximo, animated: true });
      } catch (e) {}
    }, autoPlayMs);

    return () => clearInterval(id);
  }, [marcos.length, autoPlayMs]);

  function onScrollMarcos(e) {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / tamanho);
    if (idx >= 0 && idx < marcos.length) {
      indiceRef.current = idx;
      onChangeIndice?.(idx);
    }
  }

  return (
    <View
      style={[
        styles.ciclo,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: corPrincipal,
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
        style={[styles.lista, { width: tamanho }]}
        getItemLayout={(_, index) => ({
          length: tamanho,
          offset: tamanho * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: tamanho }]}>
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
  );
}

const styles = StyleSheet.create({
  ciclo: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    overflow: 'hidden',
    gap:12
  },
  fase: {
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
  },
  lista: {
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
  bolinhaProximo: {
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
    gap: 3,
    marginTop: 6,
    marginBottom: 4,
  },
  dot: {
    width: 3,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotAtivo: {
    backgroundColor: '#fff',
    width: 7,
  },
});