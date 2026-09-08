import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import ItemLista from '../../componentes/ItemLista';
import useHeaderAdd from '../../componentes/HeaderAdd';

export default function EstoqueRacao() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);



  useHeaderAdd('NovoEstoqueRacao', 'Estoque de ração')

  useEffect(() => {
    if (!uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'estoqueRacao'),
      where('userId', '==', uid)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        dados.sort((a, b) => (b.data || 0) - (a.data || 0));
        setLista(dados);
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function excluir(item) {
    Alert.alert('Excluir', `Excluir ${item.descricao || 'este estoque'}?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'estoqueRacao', item.id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  }

  const kgTotal = lista.reduce((s, i) => s + (Number(i.kgRestante ?? i.kg) || 0), 0);

  function renderItem({ item }) {
    const restante = Number(item.kgRestante ?? item.kg) || 0;
    const negativo = restante < 0;

    return (
      <ItemLista
        titulo={item.descricao || 'Ração'}
        subtitulo={`${formatarData(item.data)}  ·  R$ ${Number(item.precoKg || 0).toFixed(2)}/kg`}
        direita={`${restante.toFixed(1)} kg`}
        onExcluir={() => excluir(item)}
      >
        <Text style={[styles.itemSub, negativo && { color: '#c0392b' }]}>
          {Number(item.kg || 0).toFixed(1)} kg comprados  ·  R$ {Number(item.valor || 0).toFixed(2)}
          {negativo ? '  ·  saldo negativo' : ''}
        </Text>
      </ItemLista>
    );
  }

  return (
    <View style={styles.container}>
      {!loading && (
        <Text style={styles.saldo}>
          Saldo total: {kgTotal.toFixed(1)} kg
        </Text>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="red" />
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            <View
              style={{
                borderColor: colors.neutro,
                borderBottomWidth: 0.3,
                marginVertical: 14,
              }}
            />
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma ração no estoque</Text>
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saldo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 16,
    color: '#333',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});