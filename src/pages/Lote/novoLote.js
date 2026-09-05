import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function NovoLote() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [qt, setQt] = useState('');
  const [prodEstimada, setProdEstimada] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function CadastrarLote() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    if (!nome.trim() || !qt) {
      Alert.alert('Atenção', 'Preencha nome e quantidade');
      return;
    }

    try {
      setSalvando(true);

      const q = query(
        collection(db, 'lotes'),
        where('userId', '==', uid),
        where('nome', '==', nome.trim())
      );
      const jaExiste = await getDocs(q);
      if (!jaExiste.empty) {
        Alert.alert('Erro', 'Já existe um lote com esse nome');
        return;
      }

      const quantidade = Number(qt);

      console.log('Salvando lote com userId:', uid);

      await addDoc(collection(db, 'lotes'), {
        chegada: Date.now(),
        nome: nome.trim(),
        raca: (raca || '').trim(),
        qt: quantidade,
        qtAtual: quantidade,
        prodEstimada: prodEstimada ? String(prodEstimada) : '',
        status: 'Cria',
        userId: uid,
      });

      setNome('');
      setRaca('');
      setQt('');
      setProdEstimada('');
      navigation.goBack();
    } catch (err) {
      console.log('Erro ao cadastrar lote:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Nome do lote"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Raça"
        value={raca}
        onChangeText={setRaca}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Quantidade de galinhas"
        keyboardType="numeric"
        value={qt}
        onChangeText={setQt}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Produção estimada por galinha (ovos)"
        keyboardType="numeric"
        value={prodEstimada}
        onChangeText={setProdEstimada}
        placeholderTextColor="#999"
      />

      <Pressable
        onPress={CadastrarLote}
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
  botao: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});