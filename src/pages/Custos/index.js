import { View, Text, StyleSheet } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import useHeaderAdd from '../../hooks/useHeaderAdd';
import ListaSimples from '../../componentes/ListaSimples';
import ItemLista from '../../componentes/ItemLista';
import { formatarData, formatarMoeda } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';

export default function Custos() {
  const { lote } = useContext(GeralContext);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

useHeaderAdd('NovoCusto', 'Custos');

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'custos'),
      where('loteId', '==', lote.id)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        dados.sort((a, b) => (b.data || 0) - (a.data || 0));
        setLista(dados.slice(0, 30));
        setLoading(false);
      },
      (error) => {
        console.log('Erro ao buscar custos:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [lote?.id]);

  function labelCategoria(cat) {
    if (cat === 'Variavel') return 'Variável';
    if (cat === 'Fixo') return 'Fixo';
    if (cat === 'Capital') return 'Capital';
    return cat || '-';
  }

  return (
    <View style={styles.container}>
      <ListaSimples
        data={lista}
        loading={loading}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {!lote ? 'Selecione um lote' : 'Nenhum custo cadastrado'}
          </Text>
        }
        renderItem={({ item }) => (
          <ItemLista
            titulo={item.descricao}
            subtitulo={`${item.idade === 'Criacao' ? 'Criação' : 'Postura'} · ${labelCategoria(item.categoria)}`}
            direita={
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.valor}>{formatarMoeda(item.valor)}</Text>
                <Text style={styles.data}>{formatarData(item.data)}</Text>
              </View>
            }
            onExcluir={() =>
              confirmDelete(
                'custos',
                item.id,
                'Excluir custo',
                `Remover "${item.descricao}" (${formatarMoeda(item.valor)})?`
              )
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vazio: { textAlign: 'center', marginTop: 30, color: '#999' },
  valor: { fontSize: 15, fontFamily: 'Roboto-Medium', color: '#000' },
  data: { fontFamily: 'Roboto-Light', fontSize: 13, color: '#000', marginTop: 2 },
});