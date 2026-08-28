import { useState, useContext } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import InputApp from '../../componentes/InputApp';
import BotaoPrincipal from '../../componentes/BotaoPrincipal';
import SeletorData from '../../componentes/SeletorData';

export default function Coleta() {
  const { lote } = useContext(GeralContext);
  const navigation = useNavigation();

  const [qt, setQt] = useState('');
  const [data, setData] = useState(new Date());

  async function CadastrarColeta() {
    if (!qt) return;
    if (!lote) {
      Alert.alert('Selecione um lote');
      return;
    }

    Alert.alert(
      '',
      `Confirma a coleta de ${qt} ovos na data de ${data.toLocaleDateString('pt-BR')}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'coletaOvos'), {
                data: data.getTime(),
                loteId: lote.id,
                qt: Number(qt),
              });
              setQt('');
              setData(new Date());
              navigation.goBack();
            } catch (error) {
              console.log('Erro:', error);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <InputApp
        value={qt}
        onChangeText={setQt}
        placeholder="Quantidade de ovos"
        keyboardType="numeric"
      />
      <SeletorData data={data} setData={setData} />
      <BotaoPrincipal titulo="Salvar coleta" onPress={CadastrarColeta} />
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