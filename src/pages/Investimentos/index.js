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
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import useHeaderAdd from '../../hooks/useHeaderAdd';
import { useAuth } from '../../contexts/AuthContext';
import ItemLista from '../../componentes/ItemLista';

export default function Investimentos() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('NovoInvestimento', 'Investimentos');

  useEffect(() => {
    if (!uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'investimentos'),
      where('userId', '==', uid)
    );

    const unsub = onSnapshot(
      q,
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
  }, [uid]);

  function parcelaMensal(item) {
    const valor = Number(item.valorTotal) || 0;
    const anos = Number(item.vidaUtilAnos) || 1;
    return valor / anos / 12;
  }

  function excluirItem(item) {
    Alert.alert('Excluir', `Remover "${item.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'investimentos', item.id));
          } catch (e) {
            Alert.alert('Erro', e?.message || 'Falha ao excluir');
          }
        },
      },
    ]);
  }

  function renderItem({ item }) {
    return (
      <ItemLista
        titulo={item.descricao || 'Investimento'}
        subtitulo={`Vida útil: ${item.vidaUtilAnos || '-'} anos · R$ ${Number(
          item.valorTotal || 0
        ).toFixed(2)}`}
        direita={`R$ ${parcelaMensal(item).toFixed(2)}/mês`}
        onExcluir={() => excluirItem(item)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.principal} />
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
              {!uid ? 'Usuário não logado' : 'Nenhum investimento'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#999' },
});