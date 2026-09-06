import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import ItemLista from '../../componentes/ItemLista';

import useHeaderAdd from '../../componentes/HeaderAdd';

const CHAVE_PADRAO = '@usarMarcosPadrao';



export default function Marcos() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarPadrao, setUsarPadrao] = useState(true);

  useHeaderAdd('NovoMarco', 'Marcos');

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
        <View style={{ flex: 1, paddingVertical: 14 }}>
          <Text style={styles.switchTitulo}>Exibir marcos padrões no ciclo</Text>
        </View>
        <Switch
          value={usarPadrao}
          onValueChange={alternarPadrao}
          trackColor={{ false: '#ddd', true: '#ddd' }}
          thumbColor={usarPadrao ? colors.principal : '#fafafa'}

        />
      </View>

     

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
              }}
            />
          }
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
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  switchTitulo: { fontFamily: 'Roboto-Medium', fontSize: 15 },
  switchSub: { fontFamily: 'Roboto-Light', fontSize: 12, color: '#777', marginTop: 2 },
  padraoBox: { paddingTop: 12, paddingBottom: 8 },
  secao: {
    fontFamily: 'Roboto-Medium',
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    marginLeft: 28,
    marginVertical:14
  },
  padraoItem: {
    fontFamily: 'Roboto-Light',
    fontSize: 14,
    color: '#333',
  },
  vazio: { textAlign: 'center', marginTop: 20, color: '#999' },
});