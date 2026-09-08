import { View, StyleSheet } from 'react-native';
import {
  TAMANHO,
  VIDA_TOTAL_SEMANAS,
  MARCOS_PADRAO,
  semanaParaAngulo,
} from '../constants/ciclo';
import { useTheme } from '@react-navigation/native';

export default function CicloMarcosPadrao({
  visivel = true,
  semanaDestaque = null,
}) {
  const { colors } = useTheme();

  if (!visivel) return null;

  const lista = MARCOS_PADRAO.filter(
    (m) => m.semana > 0 && m.semana <= VIDA_TOTAL_SEMANAS
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}
    >
      {lista.map((marco) => {
        const destaque = Number(marco.semana) === Number(semanaDestaque);

        return (
          <View
            key={`padrao-${marco.semana}-${marco.mensagem}`}
            style={[
              styles.marcoContainer,
              {
                width: TAMANHO,
                height: TAMANHO,
                transform: [{ rotate: `${semanaParaAngulo(marco.semana)}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.marco,
                {
                  backgroundColor: destaque
                    ? colors.destaque || '#f39c12'
                    : colors.destaque
                      ? colors.destaque + '99'
                      : '#999',
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
    zIndex: 1,
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
    height: 4,
    marginTop: -15,
    borderRadius: 2,
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