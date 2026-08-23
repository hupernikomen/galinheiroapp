import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useState, useContext } from "react";
import { db } from '../../services/firebaseConnection/firebase'

import { collection, addDoc } from "firebase/firestore"
import { GeralContext } from "../../contexts/geral";



export default function Ovos() {

  const { lote, CalculaProdução } = useContext(GeralContext)

  const [qt, setQt] = useState('')


  async function CadastrarColeta() {

    if (!lote) {
      alert('Selecione um lote primeiro');
      return;
    }

    try {
      addDoc(collection(db, "coletaOvos"), {
        data: Date.now(),
        loteId: lote.id,
        qt: Number(qt)
      })
    } catch (error) {

      console.log("Erro: " + err);
    }


    setQt(0)
    await CalculaProdução()
  }


  return (
    <View style={styles.constainer}>



      <Text>Quantidade Coletada</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={qt} onChangeText={setQt} />

      <Pressable onPress={() => CadastrarColeta()} style={styles.botaoGuadar}>
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