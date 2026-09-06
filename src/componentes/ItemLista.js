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

const LARGURA_ACAO = 76;
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
          speed: 20,
        }).start();
        aberto.current = deveAbrir;
      },
    })
  ).current;

  const conteudo = (
    <View style={styles.item}>
      <View style={styles.esquerda}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        {!!subtitulo && (
          <Text style={styles.sub} numberOfLines={2}>
            {subtitulo}
          </Text>
        )}
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
    return <View style={styles.wrapper}>{conteudo}</View>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.acoes}>
          <Pressable
            onPress={onExcluir}
            style={({ pressed }) => [
              styles.botaoExcluir,
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={styles.lixeiraCirculo}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 4,
  },
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  acoes: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: LARGURA_ACAO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoExcluir: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lixeiraCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c0392b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frente: {
    elevation:5,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical:14
  },
  item: {
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  esquerda: {
    flex: 1,
    paddingRight: 12,
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#1a1a1a',
    letterSpacing: 0.1,
  },
  sub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#6b6b6b',
    marginTop: 4,
    lineHeight: 18,
  },
  direita: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: '40%',
  },
  direitaTexto: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
  },
});