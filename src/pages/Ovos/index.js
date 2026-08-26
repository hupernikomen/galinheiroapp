import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useState, useContext, useEffect } from "react";
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { GeralContext } from "../../contexts/geral";
import CampoAdd from "../../componentes/CampoAdd";
import { useTheme } from "@react-navigation/native";

export default function Ovos() {
  const { lote } = useContext(GeralContext);

  const [qt, setQt] = useState('');
  const [data, setData] = useState(null);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme()

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "coletaOvos"), // se no banco for "ColetaOvos", troque aqui
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
      <View style={[styles.item, { backgroundColor: colors.neutro }]}>
        <View>
          <Text style={styles.itemQt}>{item.qt} ovos</Text>
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
        <ActivityIndicator color="red" style={{ marginT: 20 }} />
      ) : (
        <FlatList

          ListHeaderComponent={
            <CampoAdd
              data={data}
              setData={setData}
              qt={qt}
              setQt={setQt}
            />
          }
          showsVerticalScrollIndicator={false}
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
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
    paddingHorizontal: 14,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 21,
    borderRadius: 22,
    marginBottom: 4,
  },
  itemQt: {
    fontSize: 16,
    fontFamily:'Roboto-Medium',
    color: '#000',
  },
  itemData: {
    fontSize: 14,
    fontFamily: 'Roboto-Light',
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
    color: '#000',
    marginTop: 2,
  },
});