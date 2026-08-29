import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';

import InputApp from '../../componentes/InputApp';
import BotaoPrincipal from '../../componentes/BotaoPrincipal';


export default function NovoMarco() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [semana, setSemana] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function Salvar() {
    if (!semana || !mensagem.trim()) {
      Alert.alert('Atenção', 'Preencha semana e mensagem');
      return;
    }

    const num = Number(semana);
    if (Number.isNaN(num) || num < 0) {
      Alert.alert('Atenção', 'Semana inválida');
      return;
    }

    Alert.alert(
      '',
      `Confirma o marco da semana ${num}: "${mensagem.trim()}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'marcos'), {
                semana: num,
                mensagem: mensagem.trim(),
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
        value={semana}
        onChangeText={setSemana}
        placeholder="Semana (ex: 18)"
      />
      <InputApp
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Mensagem (ex: Início da postura)"
      />



      <BotaoPrincipal titulo="Salvar" onPress={Salvar} />

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