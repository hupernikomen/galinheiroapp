import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import useHeaderAdd from '../../hooks/useHeaderAdd';
import { useAuth } from '../../contexts/AuthContext';
import { GeralContext } from '../../contexts/geral';
import ItemLista from '../../componentes/ItemLista';

export default function Lote() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();
  const { lote, setLote } = useContext(GeralContext);

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

 useHeaderAdd('NovoCusto', 'Custos Diários');

  useEffect(() => {
    if (!uid) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, 'lotes'), where('userId', '==', uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        dados.sort((a, b) => (b.chegada || 0) - (a.chegada || 0));
        setLista(dados);
        setLoading(false);
      },
      (error) => {
        console.log('Erro ao buscar lotes:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  /**
   * Apaga documentos de uma query em lotes de até 450 (limite seguro do batch = 500)
   */
  async function apagarPorQuery(q) {
    const snap = await getDocs(q);
    if (snap.empty) return 0;

    let apagados = 0;
    let batch = writeBatch(db);
    let ops = 0;

    for (const d of snap.docs) {
      batch.delete(d.ref);
      ops += 1;
      apagados += 1;

      if (ops >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    }

    if (ops > 0) {
      await batch.commit();
    }

    return apagados;
  }

  async function excluirLoteCompleto(item) {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    try {
      // 1) Coletas do lote + usuário
      const qOvos = query(
        collection(db, 'coletaOvos'),
        where('loteId', '==', item.id),
        where('userId', '==', uid)
      );
      const nOvos = await apagarPorQuery(qOvos);

      // 2) Custos do lote + usuário
      const qCustos = query(
        collection(db, 'custos'),
        where('loteId', '==', item.id),
        where('userId', '==', uid)
      );
      const nCustos = await apagarPorQuery(qCustos);

      // 3) O próprio lote
      await deleteDoc(doc(db, 'lotes', item.id));

      // 4) Se era o lote selecionado na Home, limpa
      if (lote?.id === item.id) {
        setLote(null);
      }

      console.log(
        `Lote ${item.id} excluído. Coletas: ${nOvos}, Custos: ${nCustos}`
      );
    } catch (e) {
      console.log('Erro ao excluir lote:', e);
      Alert.alert(
        'Erro',
        e?.message || 'Não foi possível excluir o lote e os dados ligados'
      );
    }
  }

  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir lote',
      `Excluir "${item.nome}"?\n\nTambém serão apagadas todas as coletas de ovos e os custos deste lote.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir tudo',
          style: 'destructive',
          onPress: () => excluirLoteCompleto(item),
        },
      ]
    );
  }

  function renderItem({ item }) {
    return (
      <ItemLista
        titulo={item.nome || 'Sem nome'}
        subtitulo={`${item.raca || '-'} · ${item.qtAtual ?? item.qt ?? 0} aves · ${formatarData(item.chegada)}`}
        onExcluir={() => confirmarExclusao(item)}
      />
    );
  }

  return (
    <View style={styles.container}>
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 21 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {!uid ? 'Usuário não logado' : 'Nenhum lote cadastrado'}
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