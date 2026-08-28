import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';

export default function NovoInvestimento() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('10');

  async function Cadastrar() {
    if (!descricao.trim() || !valorTotal || !vidaUtilAnos) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    Alert.alert(
      '',
      `Confirma o investimento "${descricao.trim()}" de R$ ${Number(valorTotal).toFixed(2)}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'investimentos'), {
                descricao: descricao.trim(),
                valorTotal: Number(valorTotal),
                vidaUtilAnos: Number(vidaUtilAnos),
                dataInicio: Date.now(),
                ativo: true,
              });
              navigation.goBack();
            } catch (e) {
              console.log(e);
              Alert.alert('Erro', 'Não foi possível salvar');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição (ex: Galpão)"
        style={styles.input}
      />
      <TextInput
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholder="Valor total"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={vidaUtilAnos}
        onChangeText={setVidaUtilAnos}
        placeholder="Vida útil (anos)"
        keyboardType="numeric"
        style={styles.input}
      />

      <Pressable
        onPress={Cadastrar}
        style={[styles.botaoSalvar, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoSalvarTexto}>Salvar investimento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#22222215',
    fontSize: 16,
    marginBottom: 12,
  },
  botaoSalvar: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
  },
});