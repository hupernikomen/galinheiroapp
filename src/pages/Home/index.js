import { StyleSheet, View, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useContext, useState, useEffect } from 'react';
import GraficoCiclo from '../../componentes/GraficoCiclo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import InfoHome from '../../componentes/InfoHome';
import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// altura aproximada da sua TabbarPersonalizada (bolinha + margem inferior)
const ALTURA_TABBAR = 78;

export default function Home() {
  const { lote, setLote, custoOvo, dadosRelogio } = useContext(GeralContext);
  const [listaLotes, setListaLotes] = useState([]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // espaço livre acima da tab bar
  const paddingBottomMain = ALTURA_TABBAR + Math.max(insets.bottom, 8);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Menu')} style={{ padding: 14 }}>
          <Ionicons name="menu" size={24} />
        </Pressable>
      ),
    });

    const unsubLotes = onSnapshot(collection(db, 'lotes'), (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaLotes(dados);
    });

    AsyncStorage.getItem('@lote').then((res) => {
      if (res) setLote(JSON.parse(res));
    });

    return () => unsubLotes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Picker
          style={styles.picker}
          selectedValue={lote?.id || ''}
          onValueChange={(itemValue) => {
            const loteSelecionado = listaLotes.find((l) => l.id === itemValue);
            setLote(loteSelecionado);
          }}
        >
          <Picker.Item label="Selecione um lote" value="" />
          {listaLotes?.map((item) => (
            <Picker.Item key={item.id} label={item?.nome} value={item?.id} />
          ))}
        </Picker>
      </View>

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
  topo: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
  },
  picker: {
    width: '100%',
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