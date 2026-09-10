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

export default function NovoInvestimento() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date());
  const [salvando, setSalvando] = useState(false);



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

      <DataCampo
        value={dataInicio}
        onChange={setDataInicio}
        maximumDate={new Date()}
      />

      <InputCampo
        value={descricao}
        onChangeText={setDescricao}
        placeholder={'Quantidade (ex: Galpão)'}
      />

      <InputCampo
        value={valorTotal}
        onChangeText={setValorTotal}
        placeholder={'Valor total'}
        keyboardType='numeric'
      />
      <InputCampo
        value={vidaUtilAnos}
        onChangeText={setVidaUtilAnos}
        placeholder={'Vida útil (anos)'}
        keyboardType='numeric'
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
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