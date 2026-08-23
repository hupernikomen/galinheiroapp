import { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { GeralContext } from '../../contexts/geral';

export default function RelogioProducao({ totalOvosProduzidos, producaoTotalEstimada }) {
  const { lote, producao } = useContext(GeralContext);

  const progresso = producaoTotalEstimada > 0
    ? Math.min(totalOvosProduzidos / producaoTotalEstimada, 1)
    : 0;

  const angulo = progresso * 360;

  return (
    <View style={styles.container}>
      <View style={styles.relogio}>

        <View style={styles.bolinhaZero} />

        <View
          style={[
            styles.bolinhaContainer,
            {
              transform: [{ rotate: `${angulo}deg` }],
            },
          ]}
        >
          <View style={[styles.bolinha,           {
              transform: [{ rotate: `-${angulo}deg` }],
            },]}>
            <Text style={styles.porcentagem}>
              {(progresso * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.circuloProducao}>
          <Text style={styles.textProducao}>Produção</Text>
          <Text style={styles.textProducao}>{lote?.nome}</Text>
          <Text style={styles.producao}>{producao}%</Text>
          <Text style={styles.textProducao} >dia</Text>
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  relogio: {
    width: 180,
    height: 180,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:20
  },
  bolinhaZero: {
    position: 'absolute',
    top: -9,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  bolinhaContainer: {
    position: 'absolute',
    zIndex: 999,
    width: 180,
    height: 180,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    elevation:5,
    width: 40,
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginTop: -15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  circuloProducao: {
    position: 'absolute',
    padding: 20,
    width: 160,
    aspectRatio: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    elevation: 20
  },
  textProducao: {
    fontFamily:'Roboto-Regular',
    textAlign: 'center',
    fontSize: 14,
    color: '#fff'
  },
  producao: {
    fontSize: 30,
    fontFamily: 'Roboto-Black',
    color: '#fff'
  },

  porcentagem: {
    fontFamily:'Roboto-Regular',
    fontSize: 12,
    color: '#000',
  },
});