import { useState, useContext } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Alert, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';

const CATEGORIAS = [
  { label: 'Variável (dia a dia)', value: 'Variavel' },
  { label: 'Fixo (mensal)', value: 'Fixo' },
  { label: 'Capital (depreciação)', value: 'Capital' },
];

const SUGESTOES = {
  Variavel: 'Ex: pintainhas, ração, embalagem',
  Fixo: 'Ex: mão de obra, energia, água',
  Capital: 'Ex: depreciação galpão, equipamentos',
};

export default function NovoCusto() {
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [idade, setIdade] = useState('Criacao');
  const [categoria, setCategoria] = useState('Variavel');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);

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

  async function CadastrarCusto() {
    if (!descricao.trim() || !valor) {
      Alert.alert('Atenção', 'Preencha descrição e valor');
      return;
    }
    if (!lote?.id) {
      Alert.alert('Atenção', 'Selecione um lote primeiro');
      return;
    }

    Alert.alert(
      '',
      `Confirma o custo "${descricao.trim()}" de R$ ${Number(valor).toFixed(2)}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'custos'), {
                data: data.getTime(),
                loteId: lote.id,
                descricao: descricao.trim(),
                valor: Number(valor),
                idade,
                categoria,
              });

              setDescricao('');
              setValor('');
              setIdade('Criacao');
              setCategoria('Variavel');
              setData(new Date());

              navigation.goBack();
            } catch (error) {
              console.log('Erro:', error);
              Alert.alert('Erro', 'Não foi possível salvar o custo');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder={SUGESTOES[categoria] || 'Descrição'}
        style={styles.input}
      />

      <TextInput
        value={valor}
        onChangeText={setValor}
        placeholder="Valor (R$)"
        keyboardType="numeric"
        style={styles.input}
      />

      <Pressable onPress={abrirCalendario} style={styles.botaoInput}>
        <Text style={styles.dataTexto}>
          {data?.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={24} color={colors.principal} />
      </Pressable>

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={idade}
          onValueChange={setIdade}
          style={styles.picker}
        >
          <Picker.Item label="Fase: Criação" value="Criacao" />
          <Picker.Item label="Fase: Postura" value="Postura" />
        </Picker>
      </View>

      <View style={styles.pickerBox}>
        <Picker
          selectedValue={categoria}
          onValueChange={setCategoria}
          style={styles.picker}
        >
          {CATEGORIAS.map((c) => (
            <Picker.Item key={c.value} label={c.label} value={c.value} />
          ))}
        </Picker>
      </View>

      <Pressable
        onPress={CadastrarCusto}
        style={[styles.botaoSalvar, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoSalvarTexto}>Salvar custo</Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onValueChange={onValueChange}
          onDismiss={() => setMostrarData(false)}
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
    backgroundColor: '#22222215',
    fontSize: 16,
    marginBottom: 12,
  },
  botaoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#22222215',
    marginBottom: 12,
  },
  dataTexto: {
    fontSize: 16,
    color: '#333',
  },
  pickerBox: {
    height: 50,
    borderRadius: 22,
    backgroundColor: '#22222215',
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  picker: {
    width: '100%',
  },
  botaoSalvar: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 16,
  },
});