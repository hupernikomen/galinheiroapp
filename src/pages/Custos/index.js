import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useContext, useState } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';

import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function Custos() {

  const { lote, CalculaProducao } = useContext(GeralContext)

  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [idade, setIdade] = useState('')

  const navigation = useNavigation()



  async function Custo() {

    if (!lote) {
      alert('Selecione um lote primeiro');
      return;
    }

    try {
      addDoc(collection(db, "custos"), {
        data: Date.now(),
        loteId: lote.id,
        descricao: descricao,
        valor: valor,
        idade: idade
      })
      navigation.navigate('HomeStack')
      await CalculaProducao()
    } catch (error) {

      console.log("Erro: " + err);
    }

  }


  return (
    <View style={styles.constainer}>

      <TextInput style={styles.input} placeholder='Descriçao' value={descricao} onChangeText={setDescricao} />
      <TextInput style={styles.input} placeholder='Valor' value={valor} onChangeText={setValor} />

      <Picker
        selectedValue={idade}
        onValueChange={(itemValue) => setIdade(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Criação" value="Criacao" />
        <Picker.Item label="Postura" value="Postura" />
      </Picker>

      <Pressable onPress={() => Custo()} style={styles.botaoGuadar}>
        <Text style={styles.textoGuardar}>Guardar</Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({
  constainer: {
    flex: 1,
    paddingHorizontal: 14,
    marginVertical: 14
  },
  input: {
    height: 50,
    borderWidth: .5,
    borderColor: '#aaa',
    paddingHorizontal: 14
  },
  botaoGuadar: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    backgroundColor: 'red',
    marginTop: 14
  },
  textoGuardar: {
    color: "#fff"
  }
})