import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme, useNavigation } from '@react-navigation/native';

export default function NovoCusto() {
  const { lote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [idade, setIdade] = useState('Criacao');
  const [salvando, setSalvando] = useState(false);

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
        data: Date.now(),
        loteId: lote.id,
        descricao: descricao.trim(),
        valor: Number(valor),
        idade: idade,
        userId: uid,
      });
      setDescricao('');
      setValor('');
      setIdade('Criacao');
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
        <Picker selectedValue={idade} onValueChange={setIdade} style={styles.picker}>
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