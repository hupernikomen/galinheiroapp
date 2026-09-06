import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NovoCusto() {
  const { lote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [idade, setIdade] = useState('Criacao');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function onChangeData(event, selectedDate) {
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
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }

  async function CadastrarCusto() {
    if (!lote?.id) {
      Alert.alert('Selecione um lote primeiro');
      return;
    }
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (!descricao.trim() || !valor) {
      Alert.alert('Atenção', 'Preencha descrição e valor');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'custos'), {
        data: data.getTime(),
        loteId: lote.id,
        descricao: descricao.trim(),
        valor: Number(valor),
        idade: idade,
        userId: uid,
      });
      setDescricao('');
      setValor('');
      setIdade('Criacao');
      setData(new Date());
      navigation.goBack();
    } catch (error) {
      console.log('Erro custo:', error);
      Alert.alert('Erro', error?.message || 'Falha ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>


      <Pressable
        onPress={abrirCalendario}
        style={[styles.botaoData, { backgroundColor: colors.neutro }]}
      >
        <Text style={styles.dataTexto}>
          Data: {data.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.principal} />
      </Pressable>


      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Valor"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
        <Picker
          selectedValue={idade}
          onValueChange={setIdade}
          style={styles.picker}
        >
          <Picker.Item label="Criação" value="Criacao" />
          <Picker.Item label="Postura" value="Postura" />
        </Picker>
      </View>


      <Pressable
        onPress={CadastrarCusto}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={onChangeData}
          onDismiss={() => setMostrarData(false)}
          maximumDate={new Date()}
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
    marginBottom: 12,
    fontSize: 16,
  },
  pickerBox: {
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  botaoData: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
  },
  botao: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});