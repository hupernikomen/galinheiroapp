import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';
import useHeaderAdd from '../../componentes/HeaderAdd';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import ItemLista from '../../componentes/ItemLista';

async function recalcularQtSaida(loteId, uid) {
  const snap = await getDocs(
    query(
      collection(db, 'baixas'),
      where('loteId', '==', loteId),
      where('userId', '==', uid)
    )
  );

  let total = 0;
  snap.forEach((d) => {
    total += Number(d.data().quantidade) || 0;
  });

  await updateDoc(doc(db, 'lotes', loteId), {
    qtSaida: total,
  });

  return total;
}

export default function Baixas() {
  const { colors } = useTheme();
  const { uid } = useAuth();
  const { lote, setLote } = useContext(AppContext);

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('NovaBaixa', 'Baixas do lote');

  useEffect(() => {
    if (!uid || !lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'baixas'),
      where('loteId', '==', lote.id),
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
  }, [uid, lote?.id]);

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function labelTipo(tipo) {
    if (tipo === 'venda') return 'Venda';
    if (tipo === 'morte') return 'Morte';
    return tipo || 'Baixa';
  }

  async function excluir(item) {
    Alert.alert(
      'Excluir',
      `Excluir registro de ${item.quantidade} ave(s)?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'baixas', item.id));
              const total = await recalcularQtSaida(lote.id, uid);
              if (setLote && lote) {
                setLote({ ...lote, qtSaida: total });
              }
            } catch (e) {
              Alert.alert('Erro', e?.message || 'Não foi possível excluir');
            }
          },
        },
      ]
    );
  }

  const totalBaixas = lista.reduce(
    (s, i) => s + (Number(i.quantidade) || 0),
    0
  );

  function renderItem({ item }) {
    return (
      <ItemLista
        titulo={`${labelTipo(item.tipo)} · ${item.quantidade} ave(s)`}
        subtitulo={formatarData(item.data)}
        onExcluir={() => excluir(item)}
      >
        {!!item.observacao && (
          <Text style={styles.obs}>{item.observacao}</Text>
        )}
      </ItemLista>
    );
  }

  if (!lote?.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.vazio}>Selecione um lote na Home</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!loading && (
        <Text style={styles.resumo}>
          {lote.nome} · Total de saídas: {totalBaixas}
        </Text>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.principal || 'red'} />
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
            <Text style={styles.vazio}>Nenhuma baixa registrada</Text>
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
  resumo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 16,
    color: '#333',
  },
  obs: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});