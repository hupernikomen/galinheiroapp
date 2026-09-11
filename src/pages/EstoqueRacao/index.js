import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect, useMemo } from 'react';
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
import ItemLista from '../../componentes/ItemLista';
import useHeaderAdd from '../../componentes/HeaderAdd';

export default function EstoqueRacao() {
  const { colors } = useTheme();
  const { uid } = useAuth();

  const [lista, setLista] = useState([]);
  const [distribuicoes, setDistribuicoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('NovoEstoqueRacao', 'Estoque de ração');

  useEffect(() => {
    if (!uid) {
      setLista([]);
      setDistribuicoes([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qEstoque = query(
      collection(db, 'estoqueRacao'),
      where('userId', '==', uid)
    );
    const qDist = query(
      collection(db, 'distribuicaoRacao'),
      where('userId', '==', uid)
    );

    const unsub1 = onSnapshot(
      qEstoque,
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

    const unsub2 = onSnapshot(
      qDist,
      (snapshot) => {
        setDistribuicoes(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      },
      (err) => console.log(err)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  // kg usados por cada compra (estoqueId)
  const kgUsadoPorEstoque = useMemo(() => {
    const map = {};
    distribuicoes.forEach((d) => {
      const id = d.estoqueId;
      if (!id) return;
      map[id] = (map[id] || 0) + (Number(d.kg) || 0);
    });
    return map;
  }, [distribuicoes]);

  const totalComprado = useMemo(
    () => lista.reduce((s, i) => s + (Number(i.kg) || 0), 0),
    [lista]
  );

  const totalDistribuido = useMemo(
    () => distribuicoes.reduce((s, d) => s + (Number(d.kg) || 0), 0),
    [distribuicoes]
  );

  const kgDisponivelGeral = totalComprado - totalDistribuido;

  // preço médio do que ainda existe (proporcional ao restante de cada compra)
  const precoMedio = useMemo(() => {
    let kgRest = 0;
    let valorRest = 0;
    lista.forEach((item) => {
      const comprado = Number(item.kg) || 0;
      const usado = kgUsadoPorEstoque[item.id] || 0;
      const rest = Math.max(0, comprado - usado);
      const preco = Number(item.precoKg) || 0;
      kgRest += rest;
      valorRest += rest * preco;
    });
    return kgRest > 0 ? valorRest / kgRest : 0;
  }, [lista, kgUsadoPorEstoque]);

  function formatarData(valor) {
    if (!valor) return '-';
    return new Date(Number(valor)).toLocaleDateString('pt-BR');
  }

  function excluir(item) {
    const usado = kgUsadoPorEstoque[item.id] || 0;
    if (usado > 0) {
      Alert.alert(
        'Não é possível excluir',
        'Esta compra já tem ração distribuída. Exclua as distribuições em Custos antes.'
      );
      return;
    }

    Alert.alert('Excluir', `Excluir ${item.descricao || 'este estoque'}?`, [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'estoqueRacao', item.id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  }

  function renderItem({ item }) {
    const comprado = Number(item.kg) || 0;
    const usado = kgUsadoPorEstoque[item.id] || 0;
    const restante = comprado - usado;
    const negativo = restante < 0;

    return (
      <ItemLista
        titulo={item.descricao || 'Ração'}
        subtitulo={`${formatarData(item.data)}  ·  R$ ${Number(
          item.precoKg || 0
        ).toFixed(2)}/kg`}
        direita={`${restante.toFixed(1)} kg`}
        onExcluir={() => excluir(item)}
      >
        <Text style={[styles.itemSub, negativo && { color: '#c0392b' }]}>
          {comprado.toFixed(1)} kg comprados
          {usado > 0 ? `  ·  ${usado.toFixed(1)} kg usados` : ''}
          {'  ·  R$ '}
          {Number(item.valor || 0).toFixed(2)}
          {negativo ? '  ·  saldo negativo' : ''}
        </Text>
      </ItemLista>
    );
  }

  return (
    <View style={styles.container}>
      {!loading && lista.length > 0 && (
        <Text style={[styles.saldo, { color: colors.principal }]}>
          Disponível: {kgDisponivelGeral.toFixed(1)} kg
          {precoMedio > 0
            ? `  ·  média R$ ${precoMedio.toFixed(2)}/kg`
            : ''}
          {'\n'}
          <Text style={styles.saldoSub}>
            {totalComprado.toFixed(1)} comprados − {totalDistribuido.toFixed(1)}{' '}
            distribuídos
          </Text>
        </Text>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="red" />
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma ração no estoque</Text>
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
  saldo: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  saldoSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#777',
  },
  itemSub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
});