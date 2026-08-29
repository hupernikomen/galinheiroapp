import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import useHeaderAdd from '../../hooks/useHeaderAdd';
import ListaSimples from '../../componentes/ListaSimples';
import ItemLista from '../../componentes/ItemLista';
import { formatarMoeda } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';

export default function Investimentos() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

useHeaderAdd('NovoInvestimento', 'Investimentos');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'investimentos'),
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
  }, []);

  function parcelaMensal(item) {
    const valor = Number(item.valorTotal) || 0;
    const anos = Number(item.vidaUtilAnos) || 1;
    return valor / anos / 12;
  }

  return (
    <View style={styles.container}>
      <ListaSimples
        data={lista}
        loading={loading}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum investimento</Text>
        }
        renderItem={({ item }) => {
          const parcela = parcelaMensal(item);
          return (
            <ItemLista
              titulo={item.descricao}
              subtitulo={`${formatarMoeda(item.valorTotal)} · ${item.vidaUtilAnos} anos\nParcela: ${formatarMoeda(parcela)}/mês`}
              direita={item.ativo !== false ? 'Ativo' : 'Inativo'}
              onExcluir={() =>
                confirmDelete(
                  'investimentos',
                  item.id,
                  'Excluir investimento',
                  `Remover "${item.descricao}" (${formatarMoeda(item.valorTotal)})?`
                )
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#999' },
});