import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function NovaCartela() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [qtd, setQtd] = useState('');
  const [capacidade, setCapacidade] = useState('30');
  const [valorTotal, setValorTotal] = useState('');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const qtdNum = Number(String(qtd).replace(',', '.')) || 0;
  const capNum = Number(String(capacidade).replace(',', '.')) || 0;
  const valorNum = Number(String(valorTotal).replace(',', '.')) || 0;
  const custoPorOvo =
    qtdNum > 0 && capNum > 0 ? valorNum / qtdNum / capNum : 0;

  function onChangeData(event, selectedDate) {
    if (Platform.OS === 'android') setMostrarData(false);
    if (event?.type === 'dismissed') {
      setMostrarData(false);
      return;
    }
    if (selectedDate) setData(selectedDate);
  }

  function abrirCalendario() {
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }

  async function Cadastrar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (qtdNum <= 0 || capNum <= 0 || valorNum <= 0) {
      Alert.alert('Atenção', 'Preencha quantidade, capacidade e valor');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'cartelas'), {
        userId: uid,
        qtd: qtdNum,
        capacidade: capNum,
        valorTotal: valorNum,
        custoPorOvo: Number(custoPorOvo.toFixed(4)),
        data: data.getTime(),
      });
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Não foi possível guardar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Quantidade de cartelas (ex: 50)"
        keyboardType="numeric"
        value={qtd}
        onChangeText={setQtd}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Capacidade (ovos por cartela)"
        keyboardType="numeric"
        value={capacidade}
        onChangeText={setCapacidade}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Valor total pago (R$)"
        keyboardType="decimal-pad"
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <Pressable
        onPress={abrirCalendario}
        style={[styles.botaoInput, { backgroundColor: colors.neutro }]}
      >
        <Text style={styles.dataTexto}>{data.toLocaleDateString('pt-BR')}</Text>
        <Ionicons name="calendar-outline" size={24} color={colors.principal} />
      </Pressable>

      {custoPorOvo > 0 && (
        <Text style={styles.resumo}>
          {qtdNum} cartelas × {capNum} ovos{'\n'}
          Custo da embalagem: R$ {custoPorOvo.toFixed(3)} / ovo
        </Text>
      )}

      <Pressable
        onPress={Cadastrar}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar compra'}
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
  botaoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
  },
  resumo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
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