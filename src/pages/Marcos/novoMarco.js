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

export default function NovoMarco() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [semana, setSemana] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function Cadastrar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (!semana || !mensagem.trim()) {
      Alert.alert('Atenção', 'Preencha semana e mensagem');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'marcos'), {
        semana: Number(semana),
        mensagem: mensagem.trim(),
        userId: uid,
        criadoEm: Date.now(),
      });
      setSemana('');
      setMensagem('');
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

      <InputCampo
        placeholder="Semana (número)"
        value={semana}
        onChangeText={setSemana}
        keyboardType="numeric"
      />
      <InputCampo
        placeholder="Mensagem"
        value={mensagem}
        onChangeText={setMensagem}
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