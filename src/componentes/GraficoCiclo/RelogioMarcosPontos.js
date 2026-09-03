import { useTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';


const VIDA_TOTAL = 91;

export default function RelogioMarcosPontos({ tamanho, marcos, semanaFoco }) {

  const { colors } = useTheme()

  return (
    <>
      {marcos
        .filter((m) => m.semana > 0 && m.semana < VIDA_TOTAL)
        .map((marco) => {
          const angulo = (marco.semana / VIDA_TOTAL) * 360;
          const isFoco = marco.semana === semanaFoco;
          return (
            <View
              key={`m-${marco.semana}-${marco.mensagem}`}
              pointerEvents="box-none"
              style={[
                styles.wrap,
                { width: tamanho, height: tamanho, transform: [{ rotate: `${angulo}deg` }] },
              ]}
            >
              <View style={[styles.marco, isFoco ? styles.marcoFoco : { backgroundColor: colors.neutro }]} />
            </View>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 3,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  marco: {
    width: 6,
    height: 10,
    borderRadius: 6,
    marginTop: -18,
    marginLeft:-1
  },
  marcoFoco: {
    backgroundColor: '#f39c12',
  },
});