import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Pressable, Alert
} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Investimentos() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: 'Investimentos',
      headerRight: () => (
        <Pressable
          onPress={() =>
            navigation.navigate('HomeStack', { screen: 'NovoInvestimento' })
          }
          style={{ marginRight: 16 }}
        >
          <Ionicons name="add" size={26} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'investimentos'),
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        dados.sort((a, b) => (b.dataInicio || 0) - (a.dataInicio || 0));
        setLista(dados);
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  function parcelaMensal(item) {
    const valor = Number(item.valorTotal) || 0;
    const anos = Number(item.vidaUtilAnos) || 1;
    return valor / anos / 12;
  }

  function excluirInvestimento(item) {
    Alert.alert(
      'Excluir investimento',
      `Remover "${item.descricao}" (R$ ${Number(item.valorTotal).toFixed(2)})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'investimentos', item.id));
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
    const parcela = parcelaMensal(item);
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.descricao}</Text>
          <Text style={styles.itemSub}>
            R$ {Number(item.valorTotal).toFixed(2)} · {item.vidaUtilAnos} anos
          </Text>
          <Text style={styles.itemSub}>
            Parcela: R$ {parcela.toFixed(2)}/mês
          </Text>
        </View>
        <View style={styles.direita}>
          <Text style={styles.itemStatus}>
            {item.ativo !== false ? 'Ativo' : 'Inativo'}
          </Text>
          <Pressable onPress={() => excluirInvestimento(item)} hitSlop={12}>
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
            <Text style={styles.vazio}>Nenhum investimento</Text>
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
  itemStatus: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#666',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});