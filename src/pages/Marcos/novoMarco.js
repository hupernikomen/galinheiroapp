import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';

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
      <TextInput
        value={semana}
        onChangeText={setSemana}
        placeholder="Semana (ex: 18)"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={mensagem}
        onChangeText={setMensagem}
        placeholder="Mensagem (ex: Início da postura)"
        style={styles.input}
      />
      <Pressable
        onPress={Salvar}
        style={[styles.botaoSalvar, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoSalvarTexto}>Salvar marco</Text>
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