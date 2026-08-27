import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Pressable, Alert, Switch
} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MARCOS_PADRAO = [
  { semana: 0, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

const CHAVE_PADRAO = '@usarMarcosPadrao';

export default function Marcos() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarPadrao, setUsarPadrao] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: 'Marcos do lote',
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('NovoMarco')}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="add" size={26} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_PADRAO).then((res) => {
      if (res !== null) setUsarPadrao(res === 'true');
    });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'marcos'), (snapshot) => {
      const dados = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      dados.sort((a, b) => (a.semana || 0) - (b.semana || 0));
      setLista(dados);
      setLoading(false);
    }, (err) => {
      console.log(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function alternarPadrao(valor) {
    setUsarPadrao(valor);
    await AsyncStorage.setItem(CHAVE_PADRAO, String(valor));
  }

  function excluirMarco(item) {
    Alert.alert(
      'Excluir marco',
      `Remover "${item.mensagem}" (semana ${item.semana})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'marcos', item.id));
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
    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.mensagem}</Text>
          <Text style={styles.itemSub}>Semana {item.semana}</Text>
        </View>
        <View style={styles.direita}>
          <Text style={styles.itemSemana}>{item.semana}s</Text>
          <Pressable onPress={() => excluirMarco(item)} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color="#c0392b" />
          </Pressable>
        </View>
      </View>
    );
  }

  function HeaderLista() {
    return (
      <View style={styles.header}>
        {/* Switch */}
        <View style={[styles.switchBox, { backgroundColor: colors.neutro }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitulo}>Marcos padrão no relógio</Text>
            <Text style={styles.switchSub}>
              Exibir os marcos fixos do sistema no círculo de vida
            </Text>
          </View>
          <Switch
            value={usarPadrao}
            onValueChange={alternarPadrao}
            trackColor={{ false: '#ccc', true: colors.principal }}
            thumbColor="#fff"
          />
        </View>

        {/* Lista dos padrões (só visual) */}
        <Text style={styles.secaoTitulo}>Marcos padrão</Text>
        {MARCOS_PADRAO.map((m) => (
          <View key={m.semana} style={styles.itemPadrao}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitulo}>{m.mensagem}</Text>
              <Text style={styles.itemSub}>Semana {m.semana}</Text>
            </View>
            <Text style={[styles.itemSemana, { color: '#888' }]}>{m.semana}s</Text>
          </View>
        ))}

        <View
          style={{
            borderColor: colors.neutro,
            borderBottomWidth: 0.3,
            marginVertical: 14,
          }}
        />

        <Text style={styles.secaoTitulo}>Meus marcos</Text>
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
          ListHeaderComponent={HeaderLista}
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
            <Text style={styles.vazio}>Nenhum marco personalizado</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 21, paddingTop: 8 },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  switchTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
    color: '#000',
  },
  switchSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  secaoTitulo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemPadrao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  direita: { alignItems: 'flex-end', gap: 8 },
  itemSemana: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#999',
    paddingHorizontal: 21,
  },
});