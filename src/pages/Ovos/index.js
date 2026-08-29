import { View, Text, StyleSheet } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { GeralContext } from '../../contexts/geral';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import useHeaderAdd from '../../hooks/useHeaderAdd';
import ListaSimples from '../../componentes/ListaSimples';
import ItemLista from '../../componentes/ItemLista';
import { formatarData } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';

export default function Ovos() {
  const { lote } = useContext(GeralContext);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  useHeaderAdd('Coleta', 'Lista de Coletas');

  useEffect(() => {
    if (!lote?.id) {
      setLista([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'coletaOvos'),
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
        console.log('Erro ao buscar coletas:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [lote?.id]);

  return (
    <View style={styles.container}>
      <ListaSimples
        data={lista}
        loading={loading}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma coleta cadastrada</Text>
        }
        renderItem={({ item }) => {
          const qtdGalinhas = Number(lote?.qtAtual) || 1;
          const producaoDia = ((Number(item.qt) || 0) / qtdGalinhas) * 100;

          return (
            <ItemLista
              titulo={`${item.qt} ovos`}
              subtitulo={`Produção de ${producaoDia.toFixed(1)}%`}
              direita={formatarData(item.data)}
              onExcluir={() =>
                confirmDelete(
                  'coletaOvos',
                  item.id,
                  'Excluir coleta',
                  `Remover ${item.qt} ovos de ${formatarData(item.data)}?`
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