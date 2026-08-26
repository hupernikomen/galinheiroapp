import {
  View, Text, TextInput, StyleSheet, Pressable,
  FlatList, ActivityIndicator, Alert
} from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';

// Categorias de custo (planejamento)
const CATEGORIAS = [
  { label: 'Variável (dia a dia)', value: 'Variavel' },
  { label: 'Fixo (mensal)', value: 'Fixo' },
  { label: 'Capital (depreciação)', value: 'Capital' },
];

// Sugestões por categoria (opcional no placeholder)
const SUGESTOES = {
  Variavel: 'Ex: ração, vacina, embalagem, cama',
  Fixo: 'Ex: mão de obra, energia, água, combustível',
  Capital: 'Ex: depreciação galpão, equipamentos, plantel',
};

export default function Custos() {
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [idade, setIdade] = useState('Criacao');       // fase do lote
  const [categoria, setCategoria] = useState('Variavel'); // tipo do custo
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dados.sort((a, b) => (b.data || 0) - (a.data || 0));
      setLista(dados.slice(0, 30));
      setLoading(false);
    }, (error) => {
      console.log('Erro ao buscar custos:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [lote?.id]);

  async function CadastrarCusto() {
    if (!lote?.id) {
      Alert.alert('Atenção', 'Selecione um lote primeiro');
      return;
    }

    if (!descricao || !valor) {
      Alert.alert('Atenção', 'Preencha descrição e valor');
      return;
    }

    try {
      await addDoc(collection(db, 'custos'), {
        data: Date.now(),
        loteId: lote.id,
        descricao: descricao.trim(),
        valor: Number(valor),
        idade: idade,           // Criacao | Postura (cálculo do ovo)
        categoria: categoria,   // Variavel | Fixo | Capital
      });

      setDescricao('');
      setValor('');
      setIdade('Criacao');
      setCategoria('Variavel');
    } catch (error) {
      console.log('Erro:', error);
      Alert.alert('Erro', 'Não foi possível salvar o custo');
    }
  }

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function formatarValor(v) {
    return Number(v || 0).toFixed(2);
  }

  function labelCategoria(cat) {
    if (cat === 'Variavel') return 'Variável';
    if (cat === 'Fixo') return 'Fixo';
    if (cat === 'Capital') return 'Capital';
    return cat || '-';
  }

  function renderItem({ item }) {
    return (
      <View style={[styles.item, { backgroundColor: colors.neutro }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.descricao}</Text>
          <Text style={styles.itemSub}>
            {item.idade === 'Criacao' ? 'Criação' : 'Postura'}
            {' · '}
            {labelCategoria(item.categoria)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemValor}>R$ {formatarValor(item.valor)}</Text>
          <Text style={styles.itemData}>{formatarData(item.data)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder={SUGESTOES[categoria] || 'Descrição'}
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Valor"
          keyboardType="numeric"
          value={valor}
          onChangeText={setValor}
        />

        {/* Fase: influencia o custo do ovo */}
        <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
          <Picker
            selectedValue={idade}
            onValueChange={setIdade}
            style={styles.picker}
          >
            <Picker.Item label="Fase: Criação" value="Criacao" />
            <Picker.Item label="Fase: Postura" value="Postura" />
          </Picker>
        </View>

        {/* Categoria: organização do planejamento */}
        <View style={[styles.pickerBox, { backgroundColor: colors.neutro }]}>
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

        <Pressable onPress={CadastrarCusto} style={styles.botaoGuardar}>
          <Text style={styles.textoGuardar}>Guardar</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="red" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {!lote ? 'Selecione um lote' : 'Nenhum custo cadastrado'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  form: {
    marginBottom: 14,
    marginTop: 8,
  },
  input: {
    height: 50,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  pickerBox: {
    borderRadius: 22,
    marginBottom: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  botaoGuardar: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: 'red',
    borderRadius: 22,
    marginTop: 6,
    marginBottom: 10,
  },
  textoGuardar: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 21,
    borderRadius: 22,
    marginBottom: 4,
  },
  itemTitulo: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#000',
    marginTop: 2,
  },
  itemValor: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemData: {
    fontSize: 13,
    fontFamily: 'Roboto-Light',
    color: '#000',
    marginTop: 2,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});