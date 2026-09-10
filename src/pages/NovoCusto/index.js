import { useState, useEffect, useContext } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConnection/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import PickerCampo from '../../componentes/PickerCampo';
import InputCampo from '../../componentes/InputCampo';
import DataCampo from '../../componentes/DataCampo';
import {
  registrarRacao,
  registrarCartela,
  registrarCama,
} from '../../services/registrarCustos';

const TIPOS = [
  { value: 'racao', label: 'Consumo de ração' },
  { value: 'cartela', label: 'Cartela de ovos' },
  { value: 'cama', label: 'Cama do galinheiro' },
];

export default function NovoCusto() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { uid } = useAuth();
  const { lote } = useContext(AppContext);

  const [tipo, setTipo] = useState('racao');
  const [data, setData] = useState(new Date());
  const [salvando, setSalvando] = useState(false);



  // Ração (estoque unificado)
  const [kg, setKg] = useState('');
  const [saldoEstoque, setSaldoEstoque] = useState(0);
  const [precoMedioKg, setPrecoMedioKg] = useState(0);

  // Cartela
  const [descricaoCartela, setDescricaoCartela] = useState('');
  const [qtd, setQtd] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [valorCartela, setValorCartela] = useState('');

  // Cama
  const [descricaoCama, setDescricaoCama] = useState('');
  const [valorCama, setValorCama] = useState('');

  // Atualiza saldo e preço médio do estoque
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'estoqueRacao'),
      where('userId', '==', uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let kgTotal = 0;
      let valorPond = 0;

      snap.docs.forEach((d) => {
        const dataDoc = d.data();
        const rest = Number(dataDoc.kgRestante ?? dataDoc.kg) || 0;
        const preco = Number(dataDoc.precoKg) || 0;
        if (rest > 0) {
          kgTotal += rest;
          valorPond += rest * preco;
        }
      });

      setSaldoEstoque(kgTotal);
      setPrecoMedioKg(kgTotal > 0 ? valorPond / kgTotal : 0);
    });

    return () => unsub();
  }, [uid]);


  async function salvar() {
    if (!uid) {
      Alert.alert('Erro', 'Usuário não logado');
      return;
    }
    if (!lote?.id) {
      Alert.alert(
        'Atenção',
        'Selecione um lote na Home antes de lançar o custo'
      );
      return;
    }

    try {
      setSalvando(true);
      const dataMs = data.getTime();

      if (tipo === 'racao') {
        await registrarRacao({
          uid,
          loteId: lote.id,
          kg,
          data: dataMs,
        });
      } else if (tipo === 'cartela') {
        await registrarCartela({
          uid,
          loteId: lote.id,
          descricao: descricaoCartela,
          qtd,
          capacidade,
          valorTotal: valorCartela,
          data: dataMs,
        });
      } else if (tipo === 'cama') {
        await registrarCama({
          uid,
          loteId: lote.id,
          descricao: descricaoCama,
          valor: valorCama,
          data: dataMs,
        });
      }

      navigation.goBack();
    } catch (e) {
      Alert.alert('Atenção', e?.message || 'Não foi possível salvar');
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
      <DataCampo
        value={data}
        onChange={setData}
        maximumDate={new Date()}
      />

      <PickerCampo
        placeholder="Selecione um tipo de custo"
        selectedValue={tipo}
        onValueChange={setTipo}
        items={TIPOS}
      />



      {tipo === 'racao' && (
        <>
          <InputCampo
            placeholder="Quantidade (kg)"
            value={kg}
            onChangeText={setKg}
            keyboardType="decimal-pad"
          />
          <Text style={styles.dica}>
            Estoque:{' '}
            {saldoEstoque.toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            })}{' '}
            kg
            {precoMedioKg > 0
              ? `  ·  média R$ ${precoMedioKg.toFixed(2)}/kg`
              : '  ·  cadastre uma compra de ração'}
          </Text>


        </>
      )}

      {tipo === 'cartela' && (
        <>
          <InputCampo
            placeholder="Descrição (opcional)"
            value={descricaoCartela}
            onChangeText={setDescricaoCartela}
          />
          <InputCampo
            placeholder="Quantidade de cartelas"
            value={qtd}
            onChangeText={setQtd}
            keyboardType='number-pad'
          />
          <InputCampo
            placeholder="Ovos por cartela"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType='number-pad'
          />
          <InputCampo
            placeholder="Valor total (R$)"
            value={valorCartela}
            onChangeText={setValorCartela}
            keyboardType='decimal-pad'
          />
        </>
      )}

      {tipo === 'cama' && (
        <>
          <InputCampo
            placeholder="Descrição (opcional)"
            value={descricaoCama}
            onChangeText={setDescricaoCama}
          />
          <InputCampo
            placeholder="Valor total (R$)"
            value={valorCama}
            onChangeText={setValorCama}
            keyboardType='decimal-pad'
          />


          <Text style={styles.dica}>
            Esse valor é dividido pela produção estimada do lote no preço do
            ovo.
          </Text>
        </>
      )}

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

  dica: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    marginBottom: 12,
    marginHorizontal: 14
  },
  botao: {
    height: 55,
    borderRadius: 30,
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