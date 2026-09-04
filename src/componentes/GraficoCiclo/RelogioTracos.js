import { View, StyleSheet, Animated } from 'react-native';

const VIDA_TOTAL = 91;

export default function RelogioTracos({
  tamanho,
  semanas,
  progressNative, // Animated.Value 0→1
  corNeutra,
  corPrincipal,
  semanasTransicao = [],
}) {
  const tracos = Array.from({ length: VIDA_TOTAL }, (_, i) => i);

  function opacityDoTraco(semana) {
    if (semanas <= 0) {
      return progressNative.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
      });
    }
    const t = semana / semanas;
    const falha = 0.5 / semanas;
    return progressNative.interpolate({
      inputRange: [Math.max(0, t - falha), Math.min(1, t)],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }

  return (
    <>
      {tracos.map((semana) => {
        const angulo = (semana / VIDA_TOTAL) * 360;
        const isTransicao = semanasTransicao.includes(semana);
        const podeAnimar = semana > 0 && semana <= semanas;

        return (
          <View
            key={semana}
            pointerEvents="box-none"
            style={[
              styles.wrap,
              { width: tamanho, height: tamanho, transform: [{ rotate: `${angulo}deg` }] },
            ]}
          >
            <View
              style={[
                styles.traco,
                { backgroundColor: corNeutra },
              ]}
            />
            {podeAnimar && (
              <Animated.View
                style={[
                  styles.traco,
                  styles.tracoPassado,
                  {
                    backgroundColor: isTransicao ? '#f5dd08' : corPrincipal,
                    opacity: opacityDoTraco(semana),
                  },
                  isTransicao && styles.tracoFasePassado,
                ]}
              />
            )}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  traco: {
    position: 'absolute',
    top: -5,
    width: 1.5,
    height: 8,
    borderRadius: 1,
  },
  tracoPassado: { width: 2 },
  tracoFasePassado: { width: 3, height: 16, top: -10 },
});