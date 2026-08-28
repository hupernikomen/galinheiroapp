import { useState, useContext } from 'react';
import {
  View, StyleSheet, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, where, query, getDocs } from 'firebase/firestore';
import { GeralContext } from '../../contexts/geral';
import { useNavigation } from '@react-navigation/native';

import InputApp from '../../componentes/InputApp';
import BotaoPrincipal from '../../componentes/BotaoPrincipal';

export default function NovoLote() {
  const { BuscarLotes } = useContext(GeralContext);
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [qt, setQt] = useState('');
  const [prodEstimada, setProdEstimada] = useState('');

  async function CadastrarLote() {
    if (!nome.trim() || !qt) {
      Alert.alert('Atenção', 'Preencha nome e quantidade');
      return;
    }

    try {
      const q = query(
        collection(db, 'lotes'),
        where('nome', '==', nome.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Erro', 'Já existe um lote com esse nome');
        return;
      }

      Alert.alert(
        '',
        `Confirma o cadastro do lote "${nome.trim()}"?`,
        [
          { text: 'Não', style: 'cancel' },
          {
            text: 'Sim',
            onPress: async () => {
              try {
                await addDoc(collection(db, 'lotes'), {
                  chegada: Date.now(),
                  nome: nome.trim(),
                  raca: raca.trim(),
                  qt: Number(qt),
                  qtAtual: Number(qt),
                  prodEstimada: Number(prodEstimada) || 250,
                  status: 'Cria',
                });

                if (BuscarLotes) await BuscarLotes();
                navigation.goBack();
              } catch (err) {
                console.log('Erro:', err);
                Alert.alert('Erro', 'Não foi possível cadastrar o lote');
              }
            },
          },
        ]
      );
    } catch (err) {
      console.log('Erro:', err);
      Alert.alert('Erro', 'Não foi possível cadastrar o lote');
    }
  }

  return (
    <View style={styles.container}>

      <InputApp
        value={qt}
        onChangeText={setQt}
        placeholder="Quantidade"
      />
      <InputApp
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do lote"
      />
      <InputApp
        value={raca}
        onChangeText={setRaca}
        placeholder="Raça"
      />
      <InputApp
        value={prodEstimada}
        onChangeText={setProdEstimada}
        placeholder="Produção estimada"
      />


      <BotaoPrincipal titulo="Salvar custo" onPress={CadastrarLote} />
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