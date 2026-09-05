import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import ItemLista from '../../componentes/ItemLista';

const CHAVE_PADRAO = '@usarMarcosPadrao';

const MARCOS_PADRAO = [
  { semana: 0, mensagem: 'Início do lote' },
  { semana: 18, mensagem: 'Início da postura' },
  { semana: 70, mensagem: 'Comprar novo Lote' },
  { semana: 90, mensagem: 'Fim do ciclo' },
];

export default function Marcos() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarPadrao, setUsarPadrao] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: 'Marcos',
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
    if (!uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, 'marcos'), where('userId', '==', uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        dados.sort((a, b) => (a.semana || 0) - (b.semana || 0));
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

  async function alternarPadrao(valor) {
    setUsarPadrao(valor);
    await AsyncStorage.setItem(CHAVE_PADRAO, valor ? 'true' : 'false');
  }

  function excluirItem(item) {
    Alert.alert('Excluir', `Remover marco da semana ${item.semana}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'marcos', item.id));
          } catch (e) {
            Alert.alert('Erro', e?.message || 'Falha ao excluir');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.switchLinha}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitulo}>Marcos padrão no relógio</Text>
          <Text style={styles.switchSub}>Início, postura, 70 semanas, fim</Text>
        </View>
        <Switch
          value={usarPadrao}
          onValueChange={alternarPadrao}
          trackColor={{ true: colors.principal }}
        />
      </View>

      {usarPadrao && (
        <View style={styles.padraoBox}>
          <Text style={styles.secao}>Padrão do sistema</Text>
          {MARCOS_PADRAO.map((m) => (
            <Text key={m.semana} style={styles.padraoItem}>
              Semana {m.semana} — {m.mensagem}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.secao}>Meus marcos</Text>

      {loading ? (
        <ActivityIndicator color={colors.principal} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemLista
              titulo={`Semana ${item.semana}`}
              subtitulo={item.mensagem}
              onExcluir={() => excluirItem(item)}
            />
          )}
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
  switchLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 21,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  switchTitulo: { fontFamily: 'Roboto-Medium', fontSize: 15 },
  switchSub: { fontFamily: 'Roboto-Light', fontSize: 12, color: '#666', marginTop: 2 },
  padraoBox: { paddingHorizontal: 21, paddingTop: 12, paddingBottom: 8 },
  secao: {
    fontFamily: 'Roboto-Medium',
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    paddingHorizontal: 21,
    marginTop: 12,
    marginBottom: 8,
  },
  padraoItem: {
    fontFamily: 'Roboto-Light',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  vazio: { textAlign: 'center', marginTop: 20, color: '#999' },
});