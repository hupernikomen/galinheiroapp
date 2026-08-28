import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Pressable
} from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatarData, formatarValor, formatarMoeda } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';

export default function Custos() {
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('HomeStack', { screen: 'NovoCusto' })}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="add" size={26} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);

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
      const dados = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
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

  // function formatarData(valor) {
  //   if (!valor) return '-';
  //   return new Date(Number(valor)).toLocaleDateString('pt-BR');
  // }

  // function formatarValor(v) {
  //   return Number(v || 0).toFixed(2);
  // }

  function labelCategoria(cat) {
    if (cat === 'Variavel') return 'Variável';
    if (cat === 'Fixo') return 'Fixo';
    if (cat === 'Capital') return 'Capital';
    return cat || '-';
  }



  // exclusão


  // na UI


  // function excluirCusto(item) {
  //   Alert.alert(
  //     'Excluir custo',
  //     `Remover "${item.descricao}" (R$ ${formatarValor(item.valor)})?`,
  //     [
  //       { text: 'Cancelar', style: 'cancel' },
  //       {
  //         text: 'Excluir',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await deleteDoc(doc(db, 'custos', item.id));
  //           } catch (e) {
  //             console.log(e);
  //             Alert.alert('Erro', 'Não foi possível excluir');
  //           }
  //         },
  //       },
  //     ]
  //   );
  // }

  function renderItem({ item }) {
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.descricao}</Text>
          <Text style={styles.itemSub}>
            {item.idade === 'Criacao' ? 'Criação' : 'Postura'}
            {' · '}
            {labelCategoria(item.categoria)}
          </Text>
        </View>
        <View style={styles.direita}>
          {/* <Text style={styles.itemValor}>R$ {formatarValor(item.valor)}</Text>
          <Text style={styles.itemData}>{formatarData(item.data)}</Text> */}

          <Text>{formatarData(item.data)}</Text>
          <Text>{formatarMoeda(item.valor)}</Text>
          <Pressable onPress={() => confirmDelete(
            'custos',
            item.id,
            'Excluir custo',
            `Remover "${item.descricao}" (${formatarMoeda(item.valor)})?`
          )} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color="#c0392b" />
          </Pressable>
        </View>
      </View >
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
    gap: 6,
  },
  itemValor: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemData: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#000',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});