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
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';
import useHeaderAdd from '../../componentes/HeaderAdd';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import ItemLista from '../../componentes/ItemLista';
import { qtdAtualLote } from '../../services/calculosLote';
import { formatarData } from '../../utils/format';

export default function Lote() {
  const { colors } = useTheme();
  const { uid } = useAuth();
  const { lote, setLote } = useContext(AppContext);

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('NovoLote', 'Meus Lotes');

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
    const filtrosLoteUser = [
      where('loteId', '==', item.id),
      where('userId', '==', uid),
    ];

    const nOvos = await apagarPorQuery(
      query(collection(db, 'coletaOvos'), ...filtrosLoteUser)
    );
    const nCustos = await apagarPorQuery(
      query(collection(db, 'custos'), ...filtrosLoteUser)
    );
    const nRacao = await apagarPorQuery(
      query(collection(db, 'distribuicaoRacao'), ...filtrosLoteUser)
    );
    const nCartelas = await apagarPorQuery(
      query(collection(db, 'cartelas'), ...filtrosLoteUser)
    );
    // NOVO: registros de morte/venda do lote
    const nBaixas = await apagarPorQuery(
      query(collection(db, 'baixas'), ...filtrosLoteUser)
    );

    await deleteDoc(doc(db, 'lotes', item.id));

    if (lote?.id === item.id) {
      setLote(null);
    }

    console.log(
      `Lote ${item.id} excluído. Ovos: ${nOvos}, Custos: ${nCustos}, Ração: ${nRacao}, Cartelas: ${nCartelas}, Baixas: ${nBaixas}`
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
      `Excluir "${item.nome}"?\n\nTambém serão apagadas coletas, custos, ração e cartelas deste lote.`,
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
    const atuais = qtdAtualLote(item);
    const iniciais = Number(item.qt) || 0;
    const saidas = Number(item.qtSaida) || 0;

    return (
      <ItemLista
        titulo={item.nome || 'Sem nome'}
        subtitulo={`${item.raca || '-'} · ${atuais} aves · ${formatarData(
          item.chegada
        )}`}
        onExcluir={() => confirmarExclusao(item)}
      >
        {(saidas > 0 || iniciais > 0) && (
          <Text style={styles.itemExtra}>
            Inicial: {iniciais}
            {saidas > 0 ? ` · Saídas: ${saidas}` : ''}
          </Text>
        )}
      </ItemLista>
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 7 }}
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
  itemExtra: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});