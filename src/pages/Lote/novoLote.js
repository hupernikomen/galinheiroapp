import { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { RACAS, buscarRacaPorId } from '../../constants/racas';
import InputCampo from '../../componentes/InputCampo';
import PickerCampo from '../../componentes/PickerCampo';
import DataCampo from '../../componentes/DataCampo';

export default function NovoLote() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();

  const [nome, setNome] = useState('');
  const [racaId, setRacaId] = useState('');
  const [qt, setQt] = useState('');
  const [prodEstimada, setProdEstimada] = useState('');
  const [chegada, setChegada] = useState(new Date());
  const [salvando, setSalvando] = useState(false);

  const isOutra = racaId === 'outra';

  function onChangeRaca(id) {
    setRacaId(id);
    const raca = buscarRacaPorId(id);
    if (!raca || raca.id === 'outra') {
      setProdEstimada('');
      return;
    }
    setProdEstimada(String(raca.producaoEstimada));
  }



  async function CadastrarLote() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }

    if (!nome.trim() || !qt) {
      Alert.alert('Atenção', 'Preencha nome e quantidade');
      return;
    }

    if (!racaId) {
      Alert.alert('Atenção', 'Selecione a raça');
      return;
    }

    if (!prodEstimada || Number(prodEstimada) <= 0) {
      Alert.alert(
        'Atenção',
        isOutra
          ? 'Informe a produção estimada por galinha'
          : 'Produção estimada inválida para a raça'
      );
      return;
    }

    try {
      setSalvando(true);

      const q = query(
        collection(db, 'lotes'),
        where('userId', '==', uid),
        where('nome', '==', nome.trim())
      );
      const jaExiste = await getDocs(q);
      if (!jaExiste.empty) {
        Alert.alert('Erro', 'Já existe um lote com esse nome');
        return;
      }

      const quantidade = Number(qt);
      const racaObj = buscarRacaPorId(racaId);
      const nomeRaca = racaObj?.nome || '';

      await addDoc(collection(db, 'lotes'), {
        chegada: chegada.getTime(),
        nome: nome.trim(),
        raca: nomeRaca,
        racaId: racaId,
        qt: quantidade, // quantidade inicial (fixa)
        qtSaida: 0, // mortes + vendas (sobe com o tempo)
        prodEstimada: String(prodEstimada),
        status: 'Cria',
        inicioPostura: null,
        qtInicioPostura: null, // preenchido na 1ª coleta
        userId: uid,
      });

      setNome('');
      setRacaId('');
      setQt('');
      setProdEstimada('');
      setChegada(new Date());
      navigation.goBack();
    } catch (err) {
      console.log('Erro ao cadastrar lote:', err);
      Alert.alert('Erro', err?.message || 'Não foi possível salvar');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>

      <DataCampo
        value={chegada}
        onChange={setChegada}
        maximumDate={new Date()}
      />

      <InputCampo
        placeholder="Nome do lote"
        value={nome}
        onChangeText={setNome}
      />

      <PickerCampo
        placeholder="Selecione um tipo de custo"
        selectedValue={racaId}
        onValueChange={onChangeRaca}
        items={RACAS}
      />

      <InputCampo
        placeholder="Quantidade de galinhas"
        value={qt}
        onChangeText={setQt}
        keyboardType='numeric'
      />
      <InputCampo
        placeholder="Produção estimada por galinha (ovos)"
        value={prodEstimada}
        onChangeText={setProdEstimada}
        keyboardType='numeric'
        editable={isOutra || !racaId}
      />


      {!!racaId && !isOutra && (
        <Text style={styles.dica}>
          Produção preenchida pela raça. Escolha "Outra" para informar
          manualmente.
        </Text>
      )}

      <Pressable
        onPress={CadastrarLote}
        disabled={salvando}
        style={[styles.botao, { backgroundColor: colors.principal }]}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? 'Salvando...' : 'Guardar'}
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
 
  dica: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    marginTop: -4,
    paddingHorizontal: 4,
  },
  botao: {
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botaoTexto: {
    color: '#fff',
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
});