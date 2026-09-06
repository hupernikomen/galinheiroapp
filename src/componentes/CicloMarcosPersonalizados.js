import { View, StyleSheet } from 'react-native';
import { TAMANHO, VIDA_TOTAL_SEMANAS, semanaParaAngulo } from '../constants/ciclo';
import { useTheme } from '@react-navigation/native';

export default function CicloMarcosPersonalizados({ marcos = [] }) {

const {colors} = useTheme()

  const lista = (marcos || []).filter(
    (m) => m.semana > 0 && m.semana <= VIDA_TOTAL_SEMANAS
  );

  if (!lista.length) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}
    >
      {lista.map((marco) => (
        <View
          key={`perso-${marco.id || marco.semana}-${marco.mensagem}`}
          style={[
            styles.marcoContainer,
            {
              width: TAMANHO,
              height: TAMANHO,
              transform: [{ rotate: `${semanaParaAngulo(marco.semana)}deg` }],
            },
          ]}
        >
          <View style={[styles.marco, {backgroundColor:colors.destaque}]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  camada: {
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marcoContainer: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  marco: {
    width: 4,
    height: 4,
    marginTop: -15,
  },
});