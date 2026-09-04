import { StyleSheet, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useContext, useState, useEffect } from 'react';
import GraficoCiclo from '../../componentes/GraficoCiclo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoHome from '../../componentes/InfoHome';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALTURA_TABBAR = 78;

export default function Home() {
  const { lote, setLote, custoOvo, dadosRelogio } = useContext(GeralContext);
  const [listaLotes, setListaLotes] = useState([]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const paddingBottomMain = ALTURA_TABBAR + Math.max(insets.bottom, 8);

  // 1) Carrega lotes + último selecionado
  useEffect(() => {
    const unsubLotes = onSnapshot(collection(db, 'lotes'), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaLotes(dados);
    });

    AsyncStorage.getItem('@lote').then((res) => {
      if (res) {
        try {
          setLote(JSON.parse(res));
        } catch (e) {}
      }
    });

    return () => unsubLotes();
  }, []);

  // 2) Atualiza o header sempre que lista ou lote mudarem
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <Picker
            style={styles.picker}
            selectedValue={lote?.id || ''}
            onValueChange={(itemValue) => {
              if (!itemValue) {
                setLote(null);
                return;
              }
              const loteSelecionado = listaLotes.find((l) => l.id === itemValue);
              if (loteSelecionado) setLote(loteSelecionado);
            }}
          >
            <Picker.Item label="Selecione um lote" value="" />
            {listaLotes.map((item) => (
              <Picker.Item
                key={item.id}
                label={item?.nome || 'Sem nome'}
                value={item.id}
              />
            ))}
          </Picker>
        </View>
      ),

    });
  }, [navigation, listaLotes, lote, setLote]);

  return (
    <View style={styles.container}>
      <View style={[styles.main, { paddingBottom: paddingBottomMain }]}>
        <View style={styles.blocoGrafico}>
          <GraficoCiclo
            totalOvosProduzidos={dadosRelogio?.totalOvosProduzidos || 0}
            producaoTotalEstimada={dadosRelogio?.producaoTotalEstimada || 0}
          />
        </View>

        <View style={styles.blocoInfo}>
          <InfoHome
            totalCriacao={custoOvo?.totalCriacao || 0}
            totalPostura={custoOvo?.totalPostura || 0}
            custoProjetado={custoOvo?.custoProjetado || 0}
            precoSugerido={custoOvo?.precoSugerido || 0}
            desempenho={custoOvo?.desempenho}
            totalDepreciacao={custoOvo?.totalDepreciacao || 0}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerLeft: {
    marginLeft: 8,
    maxWidth: 220,
    justifyContent: 'center',
  },
  picker: {
    width: 200,
    height: 50,
  },
  main: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  blocoGrafico: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blocoInfo: {
    width: '100%',
    alignItems: 'center',
  },
});