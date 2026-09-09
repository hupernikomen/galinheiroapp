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
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useTheme, useNavigation } from '@react-navigation/native';
import DataCampo from '../../componentes/DataCampo';
import InputCampo from '../../componentes/InputCampo';
import { qtdAtualLote } from '../../services/calculosLote';

export default function Coleta() {
  const [qt, setQt] = useState('');
  const [data, setData] = useState(new Date());
  const [salvando, setSalvando] = useState(false);

  const { lote, setLote } = useContext(AppContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  /**
   * Primeira coleta do lote:
   * - inicioPostura = data da coleta mais antiga
   * - qtInicioPostura = galinhas vivas naquele momento (qt - qtSaida)
   */
  async function garantirInicioPostura(dataColetaMs) {
    if (!lote?.id || !uid) return;
    if (lote.inicioPostura) return;

    const snap = await getDocs(
      query(
        collection(db, 'coletaOvos'),
        where('loteId', '==', lote.id),
        where('userId', '==', uid)
      )
    );

    let inicio = dataColetaMs;
    snap.forEach((d) => {
      const t = Number(d.data().data) || 0;
      if (t > 0 && t < inicio) inicio = t;
    });

    const galinhasVivas = qtdAtualLote(lote);

    const dadosUpdate = {
      inicioPostura: inicio,
      qtInicioPostura: galinhasVivas,
    };

    await updateDoc(doc(db, 'lotes', lote.id), dadosUpdate);

    if (setLote) {
      setLote({ ...lote, ...dadosUpdate });
    }
  }

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
              const dataMs = data.getTime();

              await addDoc(collection(db, 'coletaOvos'), {
                data: dataMs,
                loteId: lote.id,
                qt: Number(qt),
                userId: uid,
              });

              await garantirInicioPostura(dataMs);

              setQt('');
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