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
} from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import ItemLista from '../../componentes/ItemLista';
import HeaderAdd from '../../componentes/HeaderAdd';
import {formatarData} from '../../utils/format'

import { useTabBarVisibility } from '../../contexts/TabBarVisibility';

function labelTipo(item) {
  if (item._origem === 'racao') return 'Ração';
  if (item._origem === 'cartela') return 'Cartela';
  const t = item.idade || item.tipo || '';
  if (t === 'Criacao') return 'Criação';
  if (t === 'Postura') return 'Postura';
  if (t === 'Cama') return 'Cama';
  return t || 'Custo';
}

export default function Custos() {
    const { onScroll } = useTabBarVisibility();
  const { colors } = useTheme();
  const { uid } = useAuth();
  const { lote } = useContext(AppContext);

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const [custos, setCustos] = useState([]);
  const [racoes, setRacoes] = useState([]);
  const [cartelas, setCartelas] = useState([]);

  HeaderAdd('NovoCusto', 'Lista de Custos');

  useEffect(() => {
    if (!uid || !lote?.id) {
      setCustos([]);
      setRacoes([]);
      setCartelas([]);
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qCustos = query(
      collection(db, 'custos'),
      where('userId', '==', uid),
      where('loteId', '==', lote.id)
    );
    const qRacao = query(
      collection(db, 'distribuicaoRacao'),
      where('userId', '==', uid),
      where('loteId', '==', lote.id)
    );
    const qCartela = query(
      collection(db, 'cartelas'),
      where('userId', '==', uid),
      where('loteId', '==', lote.id)
    );

    const unsub1 = onSnapshot(qCustos, (snap) => {
      setCustos(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _origem: 'custo',
        }))
      );
    });

    const unsub2 = onSnapshot(qRacao, (snap) => {
      setRacoes(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _origem: 'racao',
        }))
      );
    });

    const unsub3 = onSnapshot(qCartela, (snap) => {
      setCartelas(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          _origem: 'cartela',
        }))
      );
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [uid, lote?.id]);

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    const junta = [...custos, ...racoes, ...cartelas];
    junta.sort((a, b) => (b.data || 0) - (a.data || 0));
    setLista(junta);
    setLoading(false);
  }, [custos, racoes, cartelas, lote?.id]);

  // Só apaga o registro. O estoque é calculado em outro lugar:
  // total entradas - total distribuído
  async function excluirRacao(item) {
    await deleteDoc(doc(db, 'distribuicaoRacao', item.id));
  }

  function excluir(item) {
    const tipo = labelTipo(item);
    Alert.alert('Excluir', `Excluir este lançamento (${tipo})?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item._origem === 'racao') {
              await excluirRacao(item);
            } else if (item._origem === 'cartela') {
              await deleteDoc(doc(db, 'cartelas', item.id));
            } else {
              await deleteDoc(doc(db, 'custos', item.id));
            }
          } catch (e) {
            console.log(e);
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  }

  function montarTitulo(item) {
    const dataStr = formatarData(item.data);
    if (item._origem === 'racao') {
      const kg = Number(item.kg) || 0;
      return `${dataStr}  · ${kg.toLocaleString('pt-BR', {
        maximumFractionDigits: 1,
      })} kg`;
    }
    if (item._origem === 'cartela') {
      const qtd = Number(item.qtd) || 0;
      const cap = Number(item.capacidade) || 0;
      return item.descricao || `Cartela · ${qtd} × ${cap}`;
    }
    return item.descricao || labelTipo(item);
  }

  function montarSub(item) {
    const dataStr = formatarData(item.data);
    if (item._origem === 'racao') {
      return `${labelTipo(item)}`;
    }
    if (item._origem === 'cartela') {
      const qtd = Number(item.qtd) || 0;
      const cap = Number(item.capacidade) || 0;
      return `${qtd} cartelas × ${cap} ovos · ${dataStr}`;
    }
    return `${labelTipo(item)} · ${dataStr}`;
  }

  function montarValor(item) {
    if (item._origem === 'racao') {
      return Number(item.valor) || 0;
    }
    if (item._origem === 'cartela') {
      return Number(item.valorTotal ?? item.valor) || 0;
    }
    return Number(item.valor) || 0;
  }

  function renderItem({ item }) {
    const valor = montarValor(item);
    return (
      <ItemLista
        titulo={montarTitulo(item)}
        subtitulo={montarSub(item)}
        direita={`R$ ${valor.toFixed(2)}`}
        onExcluir={() => excluir(item)}
      />
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
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="red" />
        </View>
      ) : (
        <FlatList
          data={lista}
                    onScroll={onScroll}
  scrollEventThrottle={16}
          keyExtractor={(item) => `${item._origem}-${item.id}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum custo neste lote</Text>
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
  },
});