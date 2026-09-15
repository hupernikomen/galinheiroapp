import { useState, useMemo } from 'react';
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

/** Dia 1–7 → semana 1; 8–14 → semana 2; etc. */
function semanaDoDia(dia) {
  const d = Number(dia);
  if (!d || d < 1) return 0;
  return Math.ceil(d / 7);
}

export default function NovoMarco() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [dia, setDia] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  const semana = useMemo(() => semanaDoDia(dia), [dia]);

  async function Cadastrar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    const diaNum = Number(dia);
    if (!diaNum || diaNum < 1) {
      Alert.alert('Atenção', 'Informe o dia (número a partir de 1)');
      return;
    }
    if (!mensagem.trim()) {
      Alert.alert('Atenção', 'Informe a mensagem');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'marcos'), {
        dia: diaNum,
        semana: semanaDoDia(diaNum),
        mensagem: mensagem.trim(),
        userId: uid,
        criadoEm: Date.now(),
      });
      setDia('');
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
        placeholder="Dia (ex: 45)"
        value={dia}
        onChangeText={setDia}
        keyboardType="numeric"
      />

      {semana > 0 && (
        <Text style={styles.confirmacao}>
          Isso corresponde à <Text style={styles.confirmacaoDestaque}>semana {semana}</Text>
        </Text>
      )}

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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  confirmacao: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#666',
    marginTop: -4,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  confirmacaoDestaque: {
    fontFamily: 'Roboto-Medium',
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