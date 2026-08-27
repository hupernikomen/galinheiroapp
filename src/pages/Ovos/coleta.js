import { useState, useContext } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';

export default function Coleta() {
  const [qt, setQt] = useState('');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false); // só iOS

  const { lote } = useContext(GeralContext);
  const { colors } = useTheme()


  function onValueChange(event, selectedDate) {
    // Fecha sempre no Android após interagir
    if (Platform.OS === 'android') {
      setMostrarData(false);
    }

    if (event?.type === 'dismissed') {
      setMostrarData(false);
      return;
    }

    if (selectedDate) {
      setData(selectedDate);
    }
  }

  function abrirCalendario() {
    // Garante reabrir mesmo se já estava true
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }


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
      <TextInput
        value={qt}
        onChangeText={setQt}
        placeholder="Quantidade de ovos"
        keyboardType="numeric"
        style={styles.input}

      />

      <Pressable onPress={abrirCalendario} style={styles.botaoInput}>
        <Text style={styles.dataTexto}>
          {data?.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={24} color={colors.principal} />
      </Pressable>

      <Pressable onPress={CadastrarColeta} style={[styles.botaoSalvar, { backgroundColor: colors.principal }]}>
        <Text style={styles.botaoSalvarTexto}>Salvar coleta</Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onValueChange={onValueChange}
          onDismiss={() => setMostrarData(false)}
        />
      )}
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
  botaoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#22222215',
    marginBottom: 12,
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
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