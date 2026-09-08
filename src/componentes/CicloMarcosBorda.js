import { View, StyleSheet } from 'react-native';
import { TAMANHO, semanaParaAngulo } from '../constants/ciclo';
import { useTheme } from '@react-navigation/native';

/** Uma bolinha por semana que tem marco (padrão ou personalizado). */
export default function CicloMarcosBorda({
  semanas = [],
  semanaDestaque = null,
}) {
  const { colors } = useTheme();

  if (!semanas?.length) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}
    >
      {semanas.map((semana) => {
        const destaque = Number(semana) === Number(semanaDestaque);

        return (
          <View
            key={`borda-${semana}`}
            style={[
              styles.marcoContainer,
              {
                width: TAMANHO,
                height: TAMANHO,
                transform: [{ rotate: `${semanaParaAngulo(semana)}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.marco,
                {
                  backgroundColor: destaque
                    ? colors.destaque || '#f39c12'
                    : colors.destaque || '#999',
                },
                destaque && styles.marcoDestaque,
              ]}
            />
          </View>
        );
      })}
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
    width: 5,
    height: 5,
    marginTop: -15,
    borderRadius: 3,
  },
  marcoDestaque: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -18,
    borderWidth: 2,
    borderColor: '#fff',
  },
});