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

export default function NovoEstoqueRacao() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [descricao, setDescricao] = useState('');
  const [kg, setKg] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const kgNum = Number(String(kg).replace(',', '.')) || 0;
  const valorNum = Number(String(valor).replace(',', '.')) || 0;
  const precoKg = kgNum > 0 ? valorNum / kgNum : 0;

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

  async function Cadastrar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (kgNum <= 0 || valorNum <= 0) {
      Alert.alert('Atenção', 'Informe quantidade (kg) e valor');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'estoqueRacao'), {
        userId: uid,
        descricao: descricao.trim() || 'Ração',
        kg: kgNum,
        kgRestante: kgNum,
        valor: valorNum,
        precoKg: Number(precoKg.toFixed(4)),
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
        placeholder="Descrição (ex: Postura 16%)"
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Quantidade (kg)"
        keyboardType="decimal-pad"
        value={kg}
        onChangeText={setKg}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Valor pago (R$)"
        keyboardType="decimal-pad"
        value={valor}
        onChangeText={setValor}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <Pressable onPress={abrirCalendario} style={[styles.botaoInput, { backgroundColor: colors.neutro }]}>
        <Text style={styles.dataTexto}>
          {data.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={24} color={colors.principal} />
      </Pressable>

      {precoKg > 0 && (
        <Text style={styles.precoKg}>
          Custo: R$ {precoKg.toFixed(2)} / kg
        </Text>
      )}

      <Pressable
        onPress={Cadastrar}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar estoque'}
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
  precoKg: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
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