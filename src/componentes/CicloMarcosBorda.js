import { View, StyleSheet } from 'react-native';
import { TAMANHO, DIAS_TOTAL } from '../constants/ciclo';
import { useTheme } from '@react-navigation/native';

/** Ângulo no relógio: dia 0 = topo, gira no sentido horário ao longo da vida. */
function diaParaAngulo(dia) {
  const d = Math.max(0, Math.min(Number(dia) || 0, DIAS_TOTAL));
  return (d / DIAS_TOTAL) * 360;
}

/**
 * Uma marca por dia que tem marco.
 * Props novas: dias, diaDestaque
 * (semanas / semanaDestaque ainda aceitos só por compatibilidade)
 */
export default function CicloMarcosBorda({
  dias = [],
  diaDestaque = null,
  semanas = [],
  semanaDestaque = null,
}) {
  const { colors } = useTheme();

  // Preferência: lista por dia. Fallback: semanas antigas → 1º dia da semana
  const listaDias =
    dias?.length > 0
      ? dias
      : (semanas || []).map((s) => {
          const semana = Number(s) || 0;
          return semana <= 0 ? 1 : (semana - 1) * 7 + 1;
        });

  const destaque =
    diaDestaque != null
      ? Number(diaDestaque)
      : semanaDestaque != null
        ? (Number(semanaDestaque) - 1) * 7 + 1
        : null;

  if (!listaDias.length) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.camada, { width: TAMANHO, height: TAMANHO }]}
    >
      {listaDias.map((dia) => {
        const d = Number(dia);
        const isDestaque = destaque != null && d === Number(destaque);

        return (
          <View
            key={`borda-dia-${d}`}
            style={[
              styles.marcoContainer,
              {
                width: TAMANHO,
                height: TAMANHO,
                transform: [{ rotate: `${diaParaAngulo(d)}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.marco,
                {
                  backgroundColor: isDestaque
                    ? colors.destaque
                    : '#ddd',
                },
                isDestaque && styles.marcoDestaque,
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
    width: 2,
    height: 5,
    marginTop: -18,
  },
  marcoDestaque: {
    width: 2,
    height: 8,
    marginTop: -21,
  },
});