import { useState, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import DataCampo from '../../componentes/DataCampo';
import InputCampo from '../../componentes/InputCampo';
import PickerCampo from '../../componentes/PickerCampo';
import { qtdAtualLote } from '../../services/calculosLote';

const TIPOS = [
  { label: 'Morte', value: 'morte' },
  { label: 'Venda', value: 'venda' },
];

async function recalcularQtSaida(loteId, uid) {
  const snap = await getDocs(
    query(
      collection(db, 'baixas'),
      where('loteId', '==', loteId),
      where('userId', '==', uid)
    )
  );

  let total = 0;
  snap.forEach((d) => {
    total += Number(d.data().quantidade) || 0;
  });

  await updateDoc(doc(db, 'lotes', loteId), {
    qtSaida: total,
  });

  return total;
}

export default function NovaBaixa() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();
  const { lote, setLote } = useContext(AppContext);

  const [tipo, setTipo] = useState('morte');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [data, setData] = useState(new Date());
  const [salvando, setSalvando] = useState(false);

  const atuais = qtdAtualLote(lote);

  async function salvar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (!lote?.id) {
      Alert.alert('Atenção', 'Selecione um lote na Home');
      return;
    }

    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) {
      Alert.alert('Atenção', 'Informe a quantidade');
      return;
    }

    if (qtd > atuais) {
      Alert.alert(
        'Atenção',
        `Só há ${atuais} ave(s) no lote. Não é possível dar baixa de ${qtd}.`
      );
      return;
    }

    try {
      setSalvando(true);

      await addDoc(collection(db, 'baixas'), {
        data: data.getTime(),
        loteId: lote.id,
        tipo,
        quantidade: qtd,
        observacao: observacao.trim(),
        userId: uid,
      });

      const totalSaida = await recalcularQtSaida(lote.id, uid);

      if (setLote) {
        setLote({ ...lote, qtSaida: totalSaida });
      }

      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', e?.message || 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.loteLabel}>
        Lote: {lote?.nome || 'Nenhum'} · Atuais: {atuais}
      </Text>

      <DataCampo
        value={data}
        onChange={setData}
        maximumDate={new Date()}
      />

      <PickerCampo
        selectedValue={tipo}
        onValueChange={setTipo}
        items={TIPOS}
      />

      <InputCampo
        placeholder="Quantidade de aves"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="number-pad"
      />

      <InputCampo
        placeholder="Observação (opcional)"
        value={observacao}
        onChangeText={setObservacao}
      />

      <Pressable
        onPress={salvar}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loteLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  botao: {
    height: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});