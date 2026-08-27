import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  FlatList, ActivityIndicator, Alert
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';

export default function Investimentos() {
  const { colors } = useTheme();

  const [descricao, setDescricao] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [vidaUtilAnos, setVidaUtilAnos] = useState('10');
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'investimentos'), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dados.sort((a, b) => (b.dataInicio || 0) - (a.dataInicio || 0));
      setLista(dados);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function parcelaMensal(item) {
    const valor = Number(item.valorTotal) || 0;
    const anos = Number(item.vidaUtilAnos) || 1;
    return valor / anos / 12;
  }

  async function Cadastrar() {
    if (!descricao || !valorTotal || !vidaUtilAnos) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    try {
      await addDoc(collection(db, 'investimentos'), {
        descricao: descricao.trim(),
        valorTotal: Number(valorTotal),
        vidaUtilAnos: Number(vidaUtilAnos),
        dataInicio: Date.now(),
        ativo: true,
      });
      setDescricao('');
      setValorTotal('');
      setVidaUtilAnos('');
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Não foi possível salvar');
    }
  }

  function renderItem({ item }) {
    const parcela = parcelaMensal(item);
    return (
      <View style={[styles.item, { backgroundColor: colors.neutro }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitulo}>{item.descricao}</Text>
          <Text style={styles.itemSub}>
            R$ {Number(item.valorTotal).toFixed(2)} · {item.vidaUtilAnos} anos
          </Text>
          <Text style={styles.itemSub}>
            Parcela: R$ {parcela.toFixed(2)}/mês
          </Text>
        </View>
        <Text style={styles.itemStatus}>
          {item.ativo !== false ? 'Ativo' : 'Inativo'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Descrição (ex: Galpão)"
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Valor total"
          keyboardType="numeric"
          value={valorTotal}
          onChangeText={setValorTotal}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.neutro }]}
          placeholder="Vida útil (anos)"
          keyboardType="numeric"
          value={vidaUtilAnos}
          onChangeText={setVidaUtilAnos}
        />
        <Pressable onPress={Cadastrar} style={styles.botao}>
          <Text style={styles.botaoTexto}>Guardar</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="red" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum investimento</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 14 },
  form: { marginTop: 8, marginBottom: 14 },
  input: {
    height: 60, borderRadius: 25, paddingHorizontal: 16,
    marginBottom: 8, fontSize: 16,
  },
  botao: {
    height: 52, backgroundColor: 'red', borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  botaoTexto: { color: '#fff', fontFamily: 'Roboto-Medium', fontSize: 16 },
  item: {
    padding: 18, borderRadius: 22, marginBottom: 4,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  itemTitulo: { fontSize: 16, fontFamily: 'Roboto-Medium', color: '#000' },
  itemSub: { fontSize: 13, fontFamily: 'Roboto-Light', color: '#000', marginTop: 2 },
  itemStatus: { fontSize: 13, fontFamily: 'Roboto-Light', color: '#666' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#999' },
});