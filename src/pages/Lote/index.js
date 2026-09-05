import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';


import useHeaderAdd from '../../hooks/useHeaderAdd';
import ListaSimples from '../../componentes/ListaSimples';
import ItemLista from '../../componentes/ItemLista';
import { formatarData } from '../../utils/format';
import { confirmDelete } from '../../utils/confirmDelete';
import { useTheme } from '@react-navigation/native';

import { GeralContext } from '../../contexts/geral';

export default function Lote() {
  const [lista, setLista] = useState([]);
  // const [loading, setLoading] = useState(true);

  const { colors } = useTheme()

  const { listaLotes } = useContext(GeralContext)

  useHeaderAdd('NovoLote', 'Lotes');


  // useEffect(() => {
  //   const unsub = onSnapshot(
  //     collection(db, 'lotes'),
  //     (snapshot) => {
  //       const dados = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  //       dados.sort((a, b) => (b.chegada || 0) - (a.chegada || 0));
  //       setLista(dados);
  //       setLoading(false);
  //     },
  //     (error) => {
  //       console.log('Erro ao buscar lotes:', error);
  //       setLoading(false);
  //     }
  //   );
  //   return () => unsub();
  // }, []);

  function FinalizarLote(id) {
    Alert.alert(
      'Finalizar lote',
      'Este lote deixará de receber a depreciação dos investimentos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'lotes', id), {
                status: 'Finalizado',
                finalizadoEm: Date.now(),
              });
            } catch (e) {
              console.log(e);
              Alert.alert('Erro', 'Não foi possível finalizar');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ListaSimples
        data={listaLotes}
        // loading={loading}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum lote cadastrado</Text>
        }
        renderItem={({ item }) => {
          const finalizado = item.status === 'Finalizado';
          return (
            <ItemLista
              titulo={item.nome}
              subtitulo={`${item.raca || 'Sem raça'} · ${item.qtAtual || item.qt || 0} galinhas\n${finalizado ? 'Finalizado' : item.status || 'Ativo'}`}
              direita={
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text style={styles.data}>{formatarData(item.chegada)}</Text>
                  {!finalizado && (
                    <Pressable onPress={() => FinalizarLote(item.id)}>
                      <Text style={[styles.finalizar, { color: colors.principal }]}>Finalizar</Text>
                    </Pressable>
                  )}
                </View>
              }

              onExcluir={() =>
                confirmDelete(
                  'lotes',
                  item.id,
                  'Excluir lote',
                  `Remover "${item.nome}"?`
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
  data: { fontFamily: 'Roboto-Light', fontSize: 13, color: '#000' },
});