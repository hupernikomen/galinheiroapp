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
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NovoInvestimento() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date());
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
      setDataInicio(selectedDate);
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
    if (!descricao.trim() || !valorTotal || !vidaUtilAnos) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'investimentos'), {
        descricao: descricao.trim(),
        valorTotal: Number(valorTotal),
        vidaUtilAnos: Number(vidaUtilAnos),
        dataInicio: dataInicio.getTime(),
        userId: uid,
      });
      setDescricao('');
      setValorTotal('');
      setVidaUtilAnos('10');
      setDataInicio(new Date());
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', e?.message || 'Não foi possível salvar');
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
          Início: {dataInicio.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.principal} />
      </Pressable>



      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Descrição (ex: Galpão)"
        value={descricao}
        onChangeText={setDescricao}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Valor total"
        keyboardType="numeric"
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Vida útil (anos)"
        keyboardType="numeric"
        value={vidaUtilAnos}
        onChangeText={setVidaUtilAnos}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <Pressable
        onPress={Cadastrar}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={dataInicio}
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