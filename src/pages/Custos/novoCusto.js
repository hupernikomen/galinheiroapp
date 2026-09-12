import { useState, useEffect, useContext } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { AppContext } from '../../contexts/AppContext';
import PickerCampo from '../../componentes/PickerCampo';
import InputCampo from '../../componentes/InputCampo';
import DataCampo from '../../componentes/DataCampo';
import {
  registrarRacao,
  registrarCartela,
  registrarCama,
  consultarEstoqueRacao,
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

  const [kg, setKg] = useState('');
  const [saldoEstoque, setSaldoEstoque] = useState(0);
  const [precoAtualKg, setPrecoAtualKg] = useState(0);

  const [descricaoCartela, setDescricaoCartela] = useState('');
  const [qtd, setQtd] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [valorCartela, setValorCartela] = useState('');

  const [descricaoCama, setDescricaoCama] = useState('');
  const [valorCama, setValorCama] = useState('');

  // Estoque PEPS: saldo total + preço da compra que está sendo usada agora
  useEffect(() => {
    if (!uid) {
      setSaldoEstoque(0);
      setPrecoAtualKg(0);
      return;
    }

    let cancelado = false;

    async function carregar() {
      try {
        const { kgTotal, precoAtualKg: preco } =
          await consultarEstoqueRacao(uid);
        if (cancelado) return;
        setSaldoEstoque(kgTotal);
        setPrecoAtualKg(preco);
      } catch (e) {
        console.log('Erro estoque ração:', e);
        if (!cancelado) {
          setSaldoEstoque(0);
          setPrecoAtualKg(0);
        }
      }
    }

    carregar();

    // Atualiza de tempos em tempos ao focar de novo na tela seria ideal;
    // por enquanto recarrega quando muda o uid.
    return () => {
      cancelado = true;
    };
  }, [uid, tipo, salvando]);

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

  const kgNum = Number(String(kg).replace(',', '.')) || 0;
  const custoEstimado =
    tipo === 'racao' && kgNum > 0 && precoAtualKg > 0
      ? null // o custo real pode cruzar várias compras; a dica mostra o preço em uso
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <DataCampo value={data} onChange={setData} maximumDate={new Date()} />

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
            {precoAtualKg > 0
              ? `  ·  usando R$ ${precoAtualKg.toFixed(2)}/kg`
              : '  ·  cadastre uma compra de ração'}
          </Text>
          {kgNum > 0 && saldoEstoque > 0 && kgNum > saldoEstoque && (
            <Text style={[styles.dica, { color: '#c0392b' }]}>
              Quantidade maior que o estoque disponível
            </Text>
          )}
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
            keyboardType="number-pad"
          />
          <InputCampo
            placeholder="Ovos por cartela"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="number-pad"
          />
          <InputCampo
            placeholder="Valor total (R$)"
            value={valorCartela}
            onChangeText={setValorCartela}
            keyboardType="decimal-pad"
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
            keyboardType="decimal-pad"
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
  dica: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    marginBottom: 12,
    marginHorizontal: 14,
    color: '#666',
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