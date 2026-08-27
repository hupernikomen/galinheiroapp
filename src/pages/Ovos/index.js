import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useState, useContext, useEffect } from "react";
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { GeralContext } from "../../contexts/geral";
import { useNavigation, useTheme, } from "@react-navigation/native";

import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Ovos() {
  const { lote } = useContext(GeralContext);

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme()
  const navigation = useNavigation()

useEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <Pressable
        onPress={() => navigation.navigate('HomeStack', { screen: 'Coleta' })}
        style={{ marginRight: 16 }}
      >
        <Ionicons name="add" size={26} color="#000" />
      </Pressable>
    ),
  });
}, [navigation]);

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "coletaOvos"),
      where("loteId", "==", lote.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Mais recentes primeiro
      dados.sort((a, b) => (b.data || 0) - (a.data || 0));

      // Apenas os últimos 30
      setLista(dados.slice(0, 10));
      setLoading(false);
    }, (error) => {
      console.log("Erro ao buscar coletas:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [lote?.id]);

  function formatarData(valor) {
    if (!valor) return '-';
    const d = new Date(Number(valor));
    return d.toLocaleDateString('pt-BR');
  }

  function renderItem({ item }) {
    const qtdGalinhas = Number(lote?.qtAtual) || 1;
    const producaoDia = ((Number(item.qt) || 0) / qtdGalinhas) * 100;

    return (
      <View style={[styles.item]}>
        <View>
          <Text style={[styles.itemQt, { color: '#000' }]}>{item.qt} ovos</Text>
          <Text style={styles.itemProducao}>
            Produção de {producaoDia.toFixed(1)}%
          </Text>
        </View>
        <Text style={styles.itemData}>{formatarData(item.data)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>


      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="red" />
        </View>
      ) : (
        <FlatList

          ItemSeparatorComponent={<View style={{ borderColor: colors.neutro, borderBottomWidth: .3, marginVertical: 14 }} />}
          showsVerticalScrollIndicator={false}
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 21 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma coleta cadastrada</Text>
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
  item: {
    paddingHorizontal: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemQt: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  itemData: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#000',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 30,
    color: '#999',
  },
  itemProducao: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
  },
});