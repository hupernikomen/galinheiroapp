import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Pressable, Alert
} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Lote() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: 'Registro de Lotes',
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('HomeStack', { screen: 'NovoLote' })}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="add" size={26} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lotes'), (snapshot) => {
      const dados = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
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

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function FinalizarLote(id) {
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

  function excluirLote(item) {
    Alert.alert(
      'Excluir lote',
      `Remover permanentemente o lote "${item.nome}"?\nIsso não apaga coletas e custos já lançados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'lotes', item.id));
            } catch (e) {
              console.log(e);
              Alert.alert('Erro', 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    const finalizado = item.status === 'Finalizado';

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.nome}</Text>
          <Text style={styles.itemSub}>
            {item.raca || 'Sem raça'} · {item.qtAtual || item.qt || 0} galinhas
          </Text>
          <Text style={styles.itemSub}>
            {finalizado ? 'Finalizado' : (item.status || 'Ativo')}
          </Text>
        </View>

        <View style={styles.direita}>
          <Text style={styles.itemData}>{formatarData(item.chegada)}</Text>
          {!finalizado && (
            <Pressable onPress={() => FinalizarLote(item.id)}>
              <Text style={styles.textoFinalizar}>Finalizar</Text>
            </Pressable>
          )}
          <Pressable onPress={() => excluirLote(item)} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color="#c0392b" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 21 }}
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    paddingHorizontal: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitulo: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  direita: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemData: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#000',
  },
  textoFinalizar: {
    color: 'red',
    fontSize: 13,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});