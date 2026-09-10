import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import InputCampo from '../../componentes/InputCampo';
import DataCampo from '../../componentes/DataCampo';

export default function NovoEstoqueRacao() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [descricao, setDescricao] = useState('');
  const [kg, setKg] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date());
  const [salvando, setSalvando] = useState(false);

  const kgNum = Number(String(kg).replace(',', '.')) || 0;
  const valorNum = Number(String(valor).replace(',', '.')) || 0;
  const precoKg = kgNum > 0 ? valorNum / kgNum : 0;


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
      <DataCampo
        value={data}
        onChange={setData}
        maximumDate={new Date()}
      />

      <InputCampo
        value={descricao}
        onChangeText={setDescricao}
        placeholder={'Descrição (ex: Postura 16%)'}
      />

      <InputCampo
        value={kg}
        onChangeText={setKg}
        placeholder={'Quantidade (kg)'}
        keyboardType='decimal-pad'
      />

      <InputCampo
        value={valor}
        onChangeText={setValor}
        placeholder={'Valor pago (R$)'}
        keyboardType='decimal-pad'
      />


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


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  precoKg: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  botao: {
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});