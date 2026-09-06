import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import ItemLista from '../../componentes/ItemLista';
import useHeaderAdd from '../../componentes/HeaderAdd'

export default function Ovos() {
  const { lote } = useContext(AppContext);
  const { uid } = useAuth();
  const { colors } = useTheme();

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);


  useHeaderAdd('Coleta', 'Ovos');

  useEffect(() => {
    if (!lote?.id || !uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'coletaOvos'),
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
        console.log('Erro coletas:', error);
        setLoading(false);
        Alert.alert(
          'Índice do Firebase',
          'Se o erro pedir índice, abra o link do console e crie o índice composto.'
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
    Alert.alert('Excluir', 'Remover esta coleta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'coletaOvos', item.id));
          } catch (e) {
            Alert.alert('Erro', e?.message || 'Falha ao excluir');
          }
        },
      },
    ]);
  }

  function renderItem({ item }) {
    const qtdGalinhas = Number(lote?.qtAtual) || Number(lote?.qt) || 1;
    const qt = Number(item.qt) || 0;
    const producaoDia = (qt / qtdGalinhas) * 100;

    return (
      <ItemLista
        titulo={`${qt} ovos`}
        subtitulo={`Produção de ${producaoDia.toFixed(1)}%`}
        direita={formatarData(item.data)}
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
              }}
            />
          }
          contentContainerStyle={{ paddingVertical:7 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {!lote
                ? 'Selecione um lote'
                : !uid
                  ? 'Usuário não logado'
                  : 'Nenhuma coleta deste usuário'}
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