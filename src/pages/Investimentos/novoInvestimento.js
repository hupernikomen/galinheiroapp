import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';

import InputApp from '../../componentes/InputApp';
import BotaoPrincipal from '../../componentes/BotaoPrincipal';

export default function NovoInvestimento() {

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
      <InputApp
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição (ex: Galpão)"
      />
      <InputApp
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholder="Valor total"
      />
      <InputApp
        value={vidaUtilAnos}
        onChangeText={setVidaUtilAnos}
        placeholder="Vida útil (anos)"
      />


     <BotaoPrincipal titulo="Salvar" onPress={Cadastrar} />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

});