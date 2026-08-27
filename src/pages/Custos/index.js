import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
          // se a tela de cadastro tiver outro nome, ajuste aqui
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
      <View style={styles.item}>
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
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
  item: {
    paddingHorizontal: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  itemValor: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemData: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#000',
    marginTop: 2,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});