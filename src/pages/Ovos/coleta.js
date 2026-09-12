import { useState, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTheme, useNavigation } from '@react-navigation/native';
import DataCampo from '../../componentes/DataCampo';
import InputCampo from '../../componentes/InputCampo';

export default function Coleta() {
  const [qt, setQt] = useState('');
  const [data, setData] = useState(new Date());
  const [salvando, setSalvando] = useState(false);

  const { lote } = useContext(AppContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  async function CadastrarColeta() {
    if (!qt) {
      Alert.alert('Atenção', 'Informe a quantidade');
      return;
    }
    if (!lote?.id) {
      Alert.alert('Selecione um lote');
      return;
    }
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    Alert.alert(
      '',
      `Confirma a coleta de ${qt} ovos na data de ${data.toLocaleDateString(
        'pt-BR'
      )}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              setSalvando(true);

              await addDoc(collection(db, 'coletaOvos'), {
                data: data.getTime(),
                loteId: lote.id,
                qt: Number(qt),
                userId: uid,
              });

              setQt('');
              setData(new Date());
              navigation.goBack();
            } catch (error) {
              console.log('Erro coleta:', error);
              Alert.alert('Erro', error?.message || 'Falha ao salvar');
            } finally {
              setSalvando(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <DataCampo
        value={data}
        onChange={setData}
        maximumDate={new Date()}
      />

      <InputCampo
        placeholder="Quantidade coletada"
        value={qt}
        onChangeText={setQt}
        keyboardType="numeric"
      />

      <Pressable
        onPress={CadastrarColeta}
        disabled={salvando}
        style={[styles.botaoSalvar, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoSalvarTexto}>
          {salvando ? 'Salvando...' : 'Salvar coleta'}
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
  botaoSalvar: {
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});