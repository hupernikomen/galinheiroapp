import { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GeralContext } from '../../contexts/geral';
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

export default function Coleta() {
  const [qt, setQt] = useState('');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const { lote, setLote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  function onValueChange(event, selectedDate) {
    if (Platform.OS === 'android') {
      setMostrarData(false);
    }
    if (event?.type === 'dismissed') {
      setMostrarData(false);
      return;
    }
    if (selectedDate) {
      setData(selectedDate);
    }
  }

  function abrirCalendario() {
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }

  /**
   * Se o lote ainda não tem início de postura, grava a data
   * da coleta mais antiga (incluindo a que acabou de ser salva).
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

    await updateDoc(doc(db, 'lotes', lote.id), {
      inicioPostura: inicio,
    });

    // Mantém o lote selecionado atualizado no app
    if (setLote) {
      setLote({ ...lote, inicioPostura: inicio });
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
      `Confirma a coleta de ${qt} ovos na data de ${data.toLocaleDateString('pt-BR')}?`,
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
      <Pressable
        onPress={abrirCalendario}
        style={[styles.botaoInput, { backgroundColor: colors.neutro }]}
      >
        <Text style={styles.dataTexto}>{data.toLocaleDateString('pt-BR')}</Text>
        <Ionicons name="calendar-outline" size={24} color={colors.principal} />
      </Pressable>

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Quantidade coletada"
        keyboardType="numeric"
        value={qt}
        onChangeText={setQt}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
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

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onValueChange={onValueChange}
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
    fontSize: 16,
    marginBottom: 12,
  },
  botaoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
  },
  botaoSalvar: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});