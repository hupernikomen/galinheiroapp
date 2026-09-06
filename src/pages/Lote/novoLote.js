import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Text,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RACAS, buscarRacaPorId } from '../../constants/racas';

export default function NovoLote() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [nome, setNome] = useState('');
  const [racaId, setRacaId] = useState('');
  const [qt, setQt] = useState('');
  const [prodEstimada, setProdEstimada] = useState('');
  const [chegada, setChegada] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const isOutra = racaId === 'outra';

  function onChangeRaca(id) {
    setRacaId(id);
    const raca = buscarRacaPorId(id);
    if (!raca || raca.id === 'outra') {
      setProdEstimada('');
      return;
    }
    setProdEstimada(String(raca.producaoEstimada));
  }

  function onChangeData(event, selectedDate) {
    if (Platform.OS === 'android') {
      setMostrarData(false);
    }
    if (event?.type === 'dismissed') {
      setMostrarData(false);
      return;
    }
    if (selectedDate) {
      setChegada(selectedDate);
    }
  }

  function abrirCalendario() {
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }

  async function CadastrarLote() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    if (!nome.trim() || !qt) {
      Alert.alert('Atenção', 'Preencha nome e quantidade');
      return;
    }

    if (!racaId) {
      Alert.alert('Atenção', 'Selecione a raça');
      return;
    }

    if (!prodEstimada || Number(prodEstimada) <= 0) {
      Alert.alert(
        'Atenção',
        isOutra
          ? 'Informe a produção estimada por galinha'
          : 'Produção estimada inválida para a raça'
      );
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
      const racaObj = buscarRacaPorId(racaId);
      const nomeRaca = racaObj?.nome || '';

      await addDoc(collection(db, 'lotes'), {
        chegada: chegada.getTime(),
        nome: nome.trim(),
        raca: nomeRaca,
        racaId: racaId,
        qt: quantidade,
        qtAtual: quantidade,
        prodEstimada: String(prodEstimada),
        status: 'Cria',
        inicioPostura: null,
        userId: uid,
      });

      setNome('');
      setRacaId('');
      setQt('');
      setProdEstimada('');
      setChegada(new Date());
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
      <Pressable
        onPress={abrirCalendario}
        style={[styles.botaoData, { backgroundColor: colors.neutro }]}
      >
        <Text style={styles.dataTexto}>
          Chegada: {chegada.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.principal} />
      </Pressable>

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Nome do lote"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
        <Picker
          selectedValue={racaId}
          onValueChange={onChangeRaca}
          style={styles.picker}
        >
          <Picker.Item label="Selecione a raça" value="" />
          {RACAS.map((r) => (
            <Picker.Item key={r.id} label={r.nome} value={r.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: colors.neutro }]}
        placeholder="Quantidade de galinhas"
        keyboardType="numeric"
        value={qt}
        onChangeText={setQt}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.neutro,
            opacity: isOutra || !racaId ? 1 : 0.85,
          },
        ]}
        placeholder="Produção estimada por galinha (ovos)"
        keyboardType="numeric"
        value={prodEstimada}
        onChangeText={setProdEstimada}
        editable={isOutra || !racaId}
        placeholderTextColor="#999"
        underlineColorAndroid="transparent"
      />

      {!!racaId && !isOutra && (
        <Text style={styles.dica}>
          Produção preenchida pela raça. Escolha "Outra" para informar manualmente.
        </Text>
      )}

      <Pressable
        onPress={CadastrarLote}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={chegada}
          mode="date"
          display="default"
          onValueChange={onChangeData}
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
  botaoData: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
  },
  dica: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    marginTop: -4,
    paddingHorizontal: 4,
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