import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function NovoInvestimento() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('10');
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
        dataInicio: Date.now(),
        userId: uid,
      });
      setDescricao('');
      setValorTotal('');
      setVidaUtilAnos('10');
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
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