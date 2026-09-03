import { Text, StyleSheet, Animated } from 'react-native';

export default function RelogioPonteiro({
  tamanho,
  progressNative,
  anguloFinal,
  semanaTexto,
  corFundo,
}) {
  const spin = progressNative.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${anguloFinal}deg`],
  });
  const spinInverse = progressNative.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `-${anguloFinal}deg`],
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { width: tamanho, height: tamanho, transform: [{ rotate: spin }] },
      ]}
    >
      <Animated.View
        style={[
          styles.bolinha,
          { backgroundColor: corFundo, transform: [{ rotate: spinInverse }] },
        ]}
      >
        <Text style={styles.texto}>{semanaTexto}s</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    width: 30,
    aspectRatio: 1,
    borderRadius: 20,
    marginTop: -45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
    fontWeight: 'bold',
  },
});