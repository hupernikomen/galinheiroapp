import { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import {
  registrarRacao,
  registrarCartela,
  registrarCama,
} from '../../services/registrarCustos';

const TIPOS = [
  { value: 'racao', label: 'Consumo de ração' },
  { value: 'cartela', label: 'Cartela de ovos' },
  { value: 'cama', label: 'Cama do galinheiro' },
];

export default function NovoCusto() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();
  const { lote } = useContext(AppContext);

  const [tipo, setTipo] = useState('racao');
  const [data, setData] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Ração
  const [listaEstoque, setListaEstoque] = useState([]);
  const [estoqueId, setEstoqueId] = useState('');
  const [kg, setKg] = useState('');

  // Cartela
  const [descricaoCartela, setDescricaoCartela] = useState('');
  const [qtd, setQtd] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [valorCartela, setValorCartela] = useState('');

  // Cama
  const [descricaoCama, setDescricaoCama] = useState('');
  const [valorCama, setValorCama] = useState('');

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'estoqueRacao'),
      where('userId', '==', uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const dados = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListaEstoque(dados);
      if (!estoqueId && dados.length > 0) {
        setEstoqueId(dados[0].id);
      }
    });
    return () => unsub();
  }, [uid]);

  function onChangeData(event, selectedDate) {
    if (Platform.OS === 'android') setMostrarData(false);
    if (event?.type === 'dismissed') {
      setMostrarData(false);
      return;
    }
    if (selectedDate) setData(selectedDate);
  }

  function abrirCalendario() {
    setMostrarData(false);
    setTimeout(() => setMostrarData(true), 50);
  }

  async function salvar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (!lote?.id) {
      Alert.alert('Atenção', 'Selecione um lote na Home antes de lançar o custo');
      return;
    }

    try {
      setSalvando(true);
      const dataMs = data.getTime();

      if (tipo === 'racao') {
        await registrarRacao({
          uid,
          loteId: lote.id,
          estoqueId,
          kg,
          data: dataMs,
        });
      } else if (tipo === 'cartela') {
        await registrarCartela({
          uid,
          loteId: lote.id,
          descricao: descricaoCartela,
          qtd,
          capacidade,
          valorTotal: valorCartela,
          data: dataMs,
        });
      } else if (tipo === 'cama') {
        await registrarCama({
          uid,
          loteId: lote.id,
          descricao: descricaoCama,
          valor: valorCama,
          data: dataMs,
        });
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Atenção', e?.message || 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  const estoqueAtual = listaEstoque.find((e) => e.id === estoqueId);
  const saldo =
    Number(estoqueAtual?.kgRestante ?? estoqueAtual?.kg) || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.loteLabel}>
        Lote: {lote?.nome || 'Nenhum selecionado'}
      </Text>

      <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
        <Picker selectedValue={tipo} onValueChange={setTipo} style={styles.picker}>
          {TIPOS.map((t) => (
            <Picker.Item key={t.value} label={t.label} value={t.value} />
          ))}
        </Picker>
      </View>

      <Pressable
        onPress={abrirCalendario}
        style={[styles.botaoData, { backgroundColor: colors.neutro }]}
      >
        <Text style={styles.dataTexto}>
          {data.toLocaleDateString('pt-BR')}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={colors.principal} />
      </Pressable>

      {tipo === 'racao' && (
        <>
          <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
            <Picker
              selectedValue={estoqueId}
              onValueChange={setEstoqueId}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o estoque" value="" />
              {listaEstoque.map((item) => {
                const rest = Number(item.kgRestante ?? item.kg) || 0;
                return (
                  <Picker.Item
                    key={item.id}
                    label={`${item.descricao || 'Ração'} (${rest.toLocaleString(
                      'pt-BR',
                      { maximumFractionDigits: 1 }
                    )} kg)`}
                    value={item.id}
                  />
                );
              })}
            </Picker>
          </View>
          {estoqueId ? (
            <Text style={styles.dica}>
              Saldo: {saldo.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
              {estoqueAtual?.precoKg
                ? ` · R$ ${Number(estoqueAtual.precoKg).toFixed(2)}/kg`
                : ''}
            </Text>
          ) : null}
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Quantidade (kg)"
            keyboardType="decimal-pad"
            value={kg}
            onChangeText={setKg}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
        </>
      )}

      {tipo === 'cartela' && (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Descrição (opcional)"
            value={descricaoCartela}
            onChangeText={setDescricaoCartela}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Quantidade de cartelas"
            keyboardType="number-pad"
            value={qtd}
            onChangeText={setQtd}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Ovos por cartela"
            keyboardType="number-pad"
            value={capacidade}
            onChangeText={setCapacidade}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Valor total (R$)"
            keyboardType="decimal-pad"
            value={valorCartela}
            onChangeText={setValorCartela}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
        </>
      )}

      {tipo === 'cama' && (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Descrição (opcional)"
            value={descricaoCama}
            onChangeText={setDescricaoCama}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.neutro }]}
            placeholder="Valor total (R$)"
            keyboardType="decimal-pad"
            value={valorCama}
            onChangeText={setValorCama}
            placeholderTextColor="#999"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.dica}>
            Esse valor é dividido pela produção estimada do lote no preço do ovo.
          </Text>
        </>
      )}

      <Pressable
        onPress={salvar}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>

      {mostrarData && (
        <DateTimePicker
          value={data}
          mode="date"
          display="default"
          onChange={onChangeData}
          onDismiss={() => setMostrarData(false)}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loteLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
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
  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  dica: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    marginTop: -4,
  },
  botao: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});