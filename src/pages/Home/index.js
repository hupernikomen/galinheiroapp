import { StyleSheet, View, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useContext, useEffect } from 'react';
import GraficoCiclo from '../../componentes/GraficoCiclo';
import InfoHome from '../../componentes/InfoHome';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ALTURA_TABBAR = 78;

export default function Home() {
  const { lote, setLote, custoOvo, dadosRelogio, listaLotes } =
    useContext(GeralContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const paddingBottomMain = ALTURA_TABBAR + Math.max(insets.bottom, 8);

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
              const loteSelecionado = (listaLotes || []).find(
                (l) => l.id === itemValue
              );
              if (loteSelecionado) setLote(loteSelecionado);
            }}
          >
            <Picker.Item label="Selecione um lote" value="" />
            {(listaLotes || []).map((item) => (
              <Picker.Item
                key={item.id}
                label={item?.nome || 'Sem nome'}
                value={item.id}
              />
            ))}
          </Picker>
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Menu')}
          style={{ padding: 14 }}
        >
          <Ionicons name="menu" size={24} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation, listaLotes, lote, setLote]);

  return (
    <View style={styles.container}>
      <View style={[styles.main, { paddingBottom: paddingBottomMain }]}>
        <View style={styles.blocoGrafico}>
          <GraficoCiclo/>
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