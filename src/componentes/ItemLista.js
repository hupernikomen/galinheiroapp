import { useRef, useCallback } from 'react';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LARGURA_ACAO = 72;
const LIMITE = 50;

export default function ItemLista({
  titulo,
  subtitulo,
  direita,
  onExcluir,
  children,
}) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const aberto = useRef(false);

  // Fecha ao sair da tela
  useFocusEffect(
    useCallback(() => {
      return () => {
        translateX.setValue(0);
        aberto.current = false;
      };
    }, [translateX])
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !!onExcluir && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (!onExcluir) return;
        const dx = Math.min(0, Math.max(g.dx, -LARGURA_ACAO));
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, g) => {
        if (!onExcluir) return;
        const deveAbrir = g.dx < -LIMITE || (aberto.current && g.dx < -20);
        Animated.spring(translateX, {
          toValue: deveAbrir ? -LARGURA_ACAO : 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
        aberto.current = deveAbrir;
      },
    })
  ).current;

  const conteudo = (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.sub}>{subtitulo}</Text>}
        {children}
      </View>
      <View style={styles.direita}>
        {typeof direita === 'string' ? (
          <Text style={[styles.direitaTexto, { color: colors.principal }]}>
            {direita}
          </Text>
        ) : (
          direita
        )}
      </View>
    </View>
  );

  if (!onExcluir) {
    return conteudo;
  }

  return (
    <View style={styles.container}>
      <View style={styles.acoes}>
        <Pressable onPress={onExcluir} style={styles.botaoExcluir}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <Animated.View
        collapsable={false}
        style={[styles.frente, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {conteudo}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  acoes: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: LARGURA_ACAO,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoExcluir: {
    width: LARGURA_ACAO,
    height: '100%',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frente: {
    backgroundColor: '#fff',
  },
  item: {
    paddingHorizontal: 21,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  sub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  direita: {
    alignItems: 'flex-end',
    gap: 8,
  },
  direitaTexto: {
    fontSize: 15,
  },
});