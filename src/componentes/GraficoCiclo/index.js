import { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { GeralContext } from '../../contexts/geral';
import { useNavigation, useTheme } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const VIDA_TOTAL_SEMANAS = 90;

const MARCOS = [
  { semana: 0, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

const FASES = [
  { nome: 'Cria', inicio: 0, fim: 8 },
  { nome: 'Recria', inicio: 9, fim: 17 },
  { nome: 'Pré-postura', inicio: 18, fim: 19 },
  { nome: 'Postura', inicio: 20, fim: 90 },
];

export default function RelogioProducao() {

  const navigation = useNavigation()
  const { lote } = useContext(GeralContext);

  const { colors } = useTheme()

  function calcularSemanas() {
    if (!lote?.chegada) return 0;

    const dataChegada = lote.chegada?.toDate
      ? lote.chegada.toDate()
      : new Date(Number(lote.chegada));

    const hoje = new Date();
    dataChegada.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const dias = Math.floor((hoje - dataChegada) / (1000 * 60 * 60 * 24));
    return dias <= 0 ? 1 : Math.ceil(dias / 7);
  }

  function obterProximoMarco(semanas) {
    const marcosOrdenados = [...MARCOS].sort((a, b) => a.semana - b.semana);
    return marcosOrdenados.find(m => m.semana > semanas) || null;
  }

  function obterFaseAtual(semanas) {
    const fase = FASES.find(f => semanas >= f.inicio && semanas <= f.fim);
    return fase ? fase.nome : '';
  }

  const semanasTransicao = FASES.map(f => f.inicio).filter(s => s > 0);

  const semanas = calcularSemanas();
  const progresso = Math.min(semanas / VIDA_TOTAL_SEMANAS, 1);
  const angulo = progresso * 360;
  const proximoMarco = obterProximoMarco(semanas);
  const faseAtual = obterFaseAtual(semanas);

  const mensagem = proximoMarco
    ? `Semana ${proximoMarco.semana}\n${proximoMarco.mensagem}`
    : 'Ciclo finalizado';

  const marcosVisuais = MARCOS.filter(m => m.semana > 0 && m.semana < VIDA_TOTAL_SEMANAS);
  const tracos = Array.from({ length: VIDA_TOTAL_SEMANAS }, (_, i) => i);


  return (
    <Pressable onPress={() => navigation.navigate('Marcos')} style={styles.container}>
      <View style={styles.relogio}>

        {/* Traços de cada semana */}
        {tracos.map((semana) => {
          const anguloTraco = (semana / VIDA_TOTAL_SEMANAS) * 360;
          const isPassado = semana <= semanas;
          const isTransicao = semanasTransicao.includes(semana);

          return (
            <View
              key={semana}
              style={[
                styles.tracoContainer,
                { transform: [{ rotate: `${anguloTraco}deg` }] },
              ]}
            >
              <View style={[
                styles.traco, { backgroundColor: colors.neutro },
                isPassado && [styles.tracoPassado, { backgroundColor: colors.principal }],
                isTransicao && styles.tracoFase,
                isTransicao && isPassado && styles.tracoFasePassado,
              ]} />
            </View>
          );
        })}

        {marcosVisuais.map((marco) => {
          const anguloMarco = (marco.semana / VIDA_TOTAL_SEMANAS) * 360;
          const isProximo = proximoMarco?.semana === marco.semana;

          return (
            <View
              key={marco.semana}
              style={[
                styles.marcoContainer,
                { transform: [{ rotate: `${anguloMarco}deg` }] },
              ]}
            >
              <View style={[
                styles.marco,
                isProximo && styles.marcoProximo
              ]} />
            </View>
          );
        })}

        <View
          style={[
            styles.bolinhaContainer,
            { transform: [{ rotate: `${angulo}deg` }] },
          ]}
        >
          <View style={[styles.bolinha, { backgroundColor: colors.neutro, transform: [{ rotate: `-${angulo}deg` }] }]}>
            <Text style={styles.textoSemanas}>{semanas}s</Text>
          </View>
        </View>

        {/* Centro vermelho */}
        <View style={[styles.ciclo, { backgroundColor: colors.principal }]}>

          {!!faseAtual && (
            <Text style={styles.fase}>{faseAtual}</Text>
          )}
          <Text style={styles.mensagem}>{mensagem}</Text>
        </View>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 52
  },
  relogio: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
  },
  tracoContainer: {
    position: 'absolute',
    zIndex: 99,
    width: 220,
    height: 220,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  traco: {
    width: 1,
    height: 8,
    marginTop: -5,
  },
  tracoPassado: {
    width: 3,
  },
  tracoFase: {
    width: 2,
    height: 15,
    backgroundColor: '#fff',
    marginTop: -5,
  },
  tracoFasePassado: {
    backgroundColor: '#f5dd08ff',
  },
  bolinhaZero: {
    position: 'absolute',
    top: -30,
    width: 10,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  marcoContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  marco: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#22222235',
    marginTop: -15,
  },
  marcoProximo: {
    backgroundColor: '#f39c12',
    width: 6,
    height: 6,
    borderRadius: 8,
    marginTop: -15,
  },
  bolinhaContainer: {
    position: 'absolute',
    zIndex: 999,
    width: 220,
    height: 220,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bolinha: {
    width: 35,
    aspectRatio: 1,
    borderRadius: 20,
    marginTop: -55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoSemanas: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
    fontWeight: 'bold',
  },
  ciclo: {
    position: 'absolute',
    zIndex: 0,
    padding: 16,
    width: 220,
    aspectRatio: 1,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
  },
  mensagem: {
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  fase: {
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    fontSize: 20,
    color: '#ffe5e5',
    marginBottom: 6,
    marginTop: -20
  },
});
