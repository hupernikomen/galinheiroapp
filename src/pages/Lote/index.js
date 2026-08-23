import { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';

import { db } from '../../services/firebaseConnection/firebase'

import { collection, addDoc, where, query, getDocs } from "firebase/firestore"

import { GeralContext } from "../../contexts/geral";





export default function Lote() {

  const { BuscarLotes } = useContext(GeralContext)
  const [nome, setNome] = useState('')
  const [raca, setRaca] = useState('')
  const [qt, setQt] = useState('')
  



  async function CadastrarLote() {
    try {
      // Verifica se já existe um lote com o mesmo nome
      const q = query(collection(db, "lotes"), where("nome", "==", nome));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("Erro", "Já existe um lote com esse nome")
        return; // ou mostre um alerta para o usuário
      }

      await addDoc(collection(db, "lotes"), {
        chegada: Date.now(),
        nome: nome,
        raca: raca,
        qt: Number(qt)
      });

    } catch (err) {
      console.log("Erro: " + err);
    }

    setQt(0);
    await BuscarLotes();
  }


  return (
    <View style={styles.constainer}>
      <Text>Lote</Text>
      <TextInput style={styles.input} placeholder='Qtd.' keyboardType="numeric" value={qt} onChangeText={setQt} />
      <TextInput style={styles.input} placeholder='Nome' value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder='Raca' value={raca} onChangeText={setRaca} />

      <Pressable onPress={() => CadastrarLote()} style={styles.botaoGuadar}>
        <Text style={styles.textoGuardar}>Guardar</Text>
      </Pressable>

    </View>
  );
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