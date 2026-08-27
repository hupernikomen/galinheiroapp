import { StyleSheet, View, Pressable, Text } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from "../../contexts/geral";
import { useContext, useState, useEffect } from "react";
import GraficoCiclo from '../../componentes/GraficoCiclo';

import AsyncStorage from "@react-native-async-storage/async-storage";

import Ionicons from 'react-native-vector-icons/Ionicons';

import InfoHome from '../../componentes/InfoHome'


import { db } from '../../services/firebaseConnection/firebase';
import { collection, onSnapshot, } from "firebase/firestore";
import { useNavigation, useTheme } from "@react-navigation/native";

export default function Home() {
  const {
    lote,
    setLote,
    custoOvo,
    dadosRelogio,
  } = useContext(GeralContext);

  const [listaLotes, setListaLotes] = useState([]);

  const { colors } = useTheme()


  const navigation = useNavigation()

  // Carrega lista de lotes em tempo real + lote salvo
  useEffect(() => {
    const unsubLotes = onSnapshot(collection(db, "lotes"), (snapshot) => {
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListaLotes(dados);
    });

    // Carrega último lote selecionado
    AsyncStorage.getItem('@lote').then(res => {
      if (res) setLote(JSON.parse(res));
    });

    return () => unsubLotes();
  }, []);



  return (
    <View style={styles.container}>

      <View style={{ width: '100%', gap: 150, height: 65, paddingHorizontal: 14, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' }}>

        <Picker
          style={{ flex: 1 }}
          selectedValue={lote?.id || ''}
          onValueChange={(itemValue) => {
            const loteSelecionado = listaLotes.find(l => l.id === itemValue);
            setLote(loteSelecionado);
          }}
        >
          <Picker.Item label="Selecione um lote" value="" />
          {listaLotes?.map((item) => (
            <Picker.Item key={item.id} label={item?.nome} value={item?.id} />
          ))}
        </Picker>

        <Pressable onPress={() => navigation.navigate('Menu')} style={{ padding: 10, backgroundColor: colors.neutro, justifyContent: 'flex-end' }}>
          <Ionicons name={'menu-outline'} size={24} color={'#000'} />
        </Pressable>
      </View>

      <View style={styles.main}>

        <View style={{ paddingHorizontal: 18 }}>

          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GraficoCiclo
              totalOvosProduzidos={dadosRelogio?.totalOvosProduzidos || 0}
              producaoTotalEstimada={dadosRelogio?.producaoTotalEstimada || 0}
            />
          </View>


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
  },
  main: {
    alignItems: "center",
    justifyContent: "center",
  },
  caixaInfo: {
    backgroundColor: '#fff',
    elevation: 3,
    margin: 5,
    padding: 18,
    borderRadius: 12
  },
  tituloCaixaInfo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    fontWeight: 600
  },
  conteudoCaixaInfo: {
    fontFamily: 'Roboto-Light',
    color: '#000'
  },
  subInfo: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});