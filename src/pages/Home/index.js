import { StyleSheet, Text, View, TextInput, Pressable, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from "../../contexts/geral";
import { useContext, useState } from "react";
import RelogioProducao from '../../componentes/RelogioProducao';

import { db } from '../../services/firebaseConnection/firebase'

import { collection, addDoc } from "firebase/firestore"

import DateTimePicker from '@react-native-community/datetimepicker';

import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Home() {
  const {
    lote,
    setLote,
    listaLotes,
    calcularSemanasLote,
    CalculaProdução,
    custoOvo,
    dadosRelogio,
  } = useContext(GeralContext);

  const [qt, setQt] = useState('')

  async function CadastrarColeta() {

    if (!lote) {
      Alert.alert('Selecione um lote primeiro');
      return;
    }

    Alert.alert(
      '',
      `Confirma a coleta de ${qt} ovos?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
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
        },
      ]
    );


  }


  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);

  function onChangeData(event, selectedDate) {
    setMostrarData(Platform.OS === 'ios'); // no iOS fica aberto, no Android fecha
    if (selectedDate) {
      setData(selectedDate);
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', height: 60, paddingHorizontal: 14, backgroundColor: '#fff', elevation: 5 }}>

        <Picker
          selectedValue={lote?.id || ''}
          onValueChange={(itemValue) => {
            const loteSelecionado = listaLotes.find(l => l.id === itemValue);
            setLote(loteSelecionado);
          }}
        >
          <Picker.Item label="Selecione um lote" value="" />
          {listaLotes?.map((item) => (
            <Picker.Item key={item.id} label={item?.nome} value={item?.id} />
          ))}
        </Picker>
      </View>


      <View style={{ paddingHorizontal: 18 }}>

        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>

          {/* Container que agrupa o input + botão de data */}
          <View style={styles.inputComBotao}>
            <TextInput
              maxLength={3}
              placeholder="Quantidade Coletada"
              style={styles.input}
              keyboardType="numeric"
              value={qt}
              onChangeText={setQt}
            />

            {/* Botão de data */}
            <Pressable onPress={() => setMostrarData(true)} style={styles.botaoDentroInput}>
              <Ionicons name="calendar-outline" size={22} color="red" />
            </Pressable>
          </View>

          {/* Botão de adicionar */}
          <Pressable onPress={() => CadastrarColeta()} style={styles.botaoAdd}>
            <Ionicons name="add" size={24} color="red" />
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 14 }}>
          <RelogioProducao
            totalOvosProduzidos={dadosRelogio?.totalOvosProduzidos || 0}
            producaoTotalEstimada={dadosRelogio?.producaoTotalEstimada || 0}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

          <View style={styles.caixaInfo}>
            <Text style={styles.tituloCaixaInfo}>Idade</Text>
            <Text style={styles.conteudoCaixaInfo}>{calcularSemanasLote()} semanas</Text>
          </View>

          <View style={styles.caixaInfo}>
            <Text style={styles.tituloCaixaInfo}>Custo do ovo</Text>
            <Text style={styles.conteudoCaixaInfo}>R$ {custoOvo}</Text>
          </View>
        </View>

      </View>

      {/* Picker de Data */}
      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={onChangeData}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  caixaInfo: {
    backgroundColor: '#fff',
    elevation: 3,
    margin: 5,
    padding: 18,
    borderRadius: 12
  },
  tituloCaixaInfo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    fontWeight: 600
  },
  conteudoCaixaInfo: {
    fontFamily: 'Roboto-Light',
    color: '#000'
  },
  input: {
    height: 60,
    borderRadius: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: 'red',
    paddingHorizontal: 14
  },
  botaoAdd: {
    position: "absolute",
    right: 6,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 8
  },
  inputComBotao: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 10,
  marginRight: 10,
},
input: {
  flex: 1,
  height: 48,
  fontSize: 16,
},
botaoDentroInput: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#ffe5e5',
  alignItems: 'center',
  justifyContent: 'center',
},
botaoAdd: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#ffe5e5',
  alignItems: 'center',
  justifyContent: 'center',
},
});