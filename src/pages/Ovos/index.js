import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Pressable, Alert
} from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { GeralContext } from '../../contexts/geral';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatarData, formatarValor, formatarMoeda } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';

export default function Ovos() {
  const { lote } = useContext(GeralContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('HomeStack', { screen: 'Coleta' })}
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
      collection(db, 'coletaOvos'),
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
      console.log('Erro ao buscar coletas:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [lote?.id]);

  // function formatarData(valor) {
  //   if (!valor) return '-';
  //   return new Date(Number(valor)).toLocaleDateString('pt-BR');
  // }



  // function excluirColeta(item) {
  //   Alert.alert(
  //     'Excluir coleta',
  //     `Remover ${item.qt} ovos de ${formatarData(item.data)}?`,
  //     [
  //       { text: 'Cancelar', style: 'cancel' },
  //       {
  //         text: 'Excluir',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             await deleteDoc(doc(db, 'coletaOvos', item.id));
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
    const qtdGalinhas = Number(lote?.qtAtual) || 1;
    const producaoDia = ((Number(item.qt) || 0) / qtdGalinhas) * 100;

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemQt}>{item.qt} ovos</Text>
          <Text style={styles.itemProducao}>
            Produção de {producaoDia.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.direita}>
          <Text style={styles.itemData}>{formatarData(item.data)}</Text>
          <Pressable onPress={() => confirmDelete(
            'coletaOvos',
            item.id,
            'Excluir coleta',
            `Remover ${item.qt} ovos de ${formatarData(item.data)}?`
          )} hitSlop={12}>
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
            <Text style={styles.vazio}>Nenhuma coleta cadastrada</Text>
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
  itemQt: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemProducao: {
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
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});