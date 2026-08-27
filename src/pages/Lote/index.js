import { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  Alert, FlatList, ActivityIndicator
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, where, query, getDocs, onSnapshot } from 'firebase/firestore';
import { GeralContext } from '../../contexts/geral';
import { useTheme } from '@react-navigation/native';

export default function Lote() {
  const { BuscarLotes } = useContext(GeralContext);
  const { colors } = useTheme();

  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [qt, setQt] = useState('');
  const [prodEstimada, setProdEstimada] = useState('');
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lotes'), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      dados.sort((a, b) => (b.chegada || 0) - (a.chegada || 0));
      setLista(dados);
      setLoading(false);
    }, (error) => {
      console.log('Erro ao buscar lotes:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function CadastrarLote() {
    if (!nome || !qt) {
      Alert.alert('Atenção', 'Preencha nome e quantidade');
      return;
    }

    try {
      const q = query(collection(db, 'lotes'), where('nome', '==', nome.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Erro', 'Já existe um lote com esse nome');
        return;
      }

      await addDoc(collection(db, 'lotes'), {
        chegada: Date.now(),
        nome: nome.trim(),
        raca: raca.trim(),
        qt: Number(qt),
        qtAtual: Number(qt),
        prodEstimada: Number(prodEstimada) || 250,
        status: 'Cria',
      });

      setNome('');
      setRaca('');
      setQt('');
      setProdEstimada('');

      if (BuscarLotes) await BuscarLotes();
    } catch (err) {
      console.log('Erro:', err);
      Alert.alert('Erro', 'Não foi possível cadastrar o lote');
    }
  }

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }


  async function FinalizarLote(id) {
  Alert.alert(
    'Finalizar lote',
    'Este lote deixará de receber a depreciação dos investimentos.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateDoc(doc(db, 'lotes', id), {
              status: 'Finalizado',
              finalizadoEm: Date.now(),
            });
          } catch (e) {
            console.log(e);
            Alert.alert('Erro', 'Não foi possível finalizar');
          }
        },
      },
    ]
  );
}

function renderItem({ item }) {
  const finalizado = item.status === 'Finalizado';

  return (
    <View style={[styles.item, { backgroundColor: colors.neutro }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>{item.nome}</Text>
        <Text style={styles.itemSub}>
          {item.raca || 'Sem raça'} · {item.qtAtual || item.qt || 0} galinhas
        </Text>
        <Text style={styles.itemSub}>
          {finalizado ? 'Finalizado' : (item.status || 'Ativo')}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <Text style={styles.itemData}>{formatarData(item.chegada)}</Text>
        {!finalizado && (
          <Pressable onPress={() => FinalizarLote(item.id)}>
            <Text style={{ color: 'red', fontSize: 13 }}>Finalizar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

  // function renderItem({ item }) {
  //   return (
  //     <View style={[styles.item, { backgroundColor: colors.neutro }]}>
  //       <View style={{ flex: 1 }}>
  //         <Text style={styles.itemTitulo}>{item.nome}</Text>
  //         <Text style={styles.itemSub}>
  //           {item.raca || 'Sem raça'} · {item.qtAtual || item.qt || 0} galinhas
  //         </Text>
  //       </View>
  //       <Text style={styles.itemData}>{formatarData(item.chegada)}</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {/* Formulário fora da FlatList (evita teclado fechar) */}
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Quantidade"
          keyboardType="numeric"
          value={qt}
          onChangeText={setQt}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Nome do lote"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Raça"
          value={raca}
          onChangeText={setRaca}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Produção estimada por galinha"
          keyboardType="numeric"
          value={prodEstimada}
          onChangeText={setProdEstimada}
        />

        <Pressable onPress={CadastrarLote} style={styles.botaoGuardar}>
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
            <Text style={styles.vazio}>Nenhum lote cadastrado</Text>
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
  itemData: {
    fontSize: 14,
    fontFamily: 'Roboto-Light',
    color: '#000',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});