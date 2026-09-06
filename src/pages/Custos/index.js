import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebaseConnection/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import useHeaderAdd from '../../hooks/useHeaderAdd';
import ItemLista from '../../componentes/ItemLista';

export default function Custos() {
  const { lote } = useContext(GeralContext);
  const { uid } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('NovoCusto', 'Custos Diários');

  useEffect(() => {
    if (!lote?.id || !uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'custos'),
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
        setLista(dados.slice(0, 30));
        setLoading(false);
      },
      (error) => {
        console.log('Erro custos:', error);
        setLoading(false);
        Alert.alert(
          'Índice do Firebase',
          'Se o erro pedir índice, abra o link do console e crie o índice.'
        );
      }
    );

    return () => unsub();
  }, [lote?.id, uid]);

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function excluirItem(item) {
    Alert.alert('Excluir', 'Remover este custo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'custos', item.id));
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
        titulo={item.descricao || 'Sem descrição'}
        subtitulo={`${item.idade || '-'} · ${formatarData(item.data)}`}
        direita={`R$ ${Number(item.valor || 0).toFixed(2)}`}
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 7 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {!lote
                ? 'Selecione um lote'
                : !uid
                  ? 'Usuário não logado'
                  : 'Nenhum custo deste usuário'}
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
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});