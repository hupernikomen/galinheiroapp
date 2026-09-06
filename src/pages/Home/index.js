import { StyleSheet, View, Pressable, Image, Text, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { GeralContext } from '../../contexts/geral';
import { useContext, useEffect, useState, useRef } from 'react';
import Ciclo from '../../componentes/Ciclo';
import InfoHome from '../../componentes/InfoHome';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';

const ALTURA_TABBAR = 78;

export default function Home() {
  const { lote, setLote, custoOvo, dadosRelogio, listaLotes } =
    useContext(GeralContext);
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [menuAberto, setMenuAberto] = useState(false);
  const avisouLoteRef = useRef(false);

  const paddingBottomMain = ALTURA_TABBAR + Math.max(insets.bottom, 8);

  async function handleSair() {
    setMenuAberto(false);
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            Alert.alert('Erro', e?.message || 'Não foi possível sair');
          }
        },
      },
    ]);
  }

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
                style={{
                  fontFamily: 'Roboto-Medium',
                  fontSize: 16,
                }}
              />
            ))}
          </Picker>
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setMenuAberto(true)}
          style={styles.headerRightBtn}
          hitSlop={8}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={22} color="#666" />
            </View>
          )}
        </Pressable>
      ),
    });
  }, [navigation, listaLotes, lote, setLote, user]);

  // Avisa uma vez se há lotes e nenhum está selecionado
  useEffect(() => {
    if (listaLotes.length > 0 && !lote && !avisouLoteRef.current) {
      avisouLoteRef.current = true;
      Alert.alert('Lote não selecionado', 'Selecione um dos lotes criados');
    }
    if (lote) {
      avisouLoteRef.current = false;
    }
  }, [listaLotes, lote]);

  return (
    <View style={styles.container}>
      <View style={[styles.main, { paddingBottom: paddingBottomMain }]}>
        <View style={styles.blocoGrafico}>
          <Ciclo />
        </View>

        <View style={styles.blocoInfo}>
          <InfoHome
            totalCriacao={custoOvo?.totalCriacao || 0}
            totalPostura={custoOvo?.totalPostura || 0}
            custoProjetado={custoOvo?.custoProjetado || 0}
            precoSugerido={custoOvo?.precoSugerido || 0}
            desempenho={custoOvo?.desempenho}
            totalDepreciacao={custoOvo?.totalDepreciacao || 0}
            margem={custoOvo?.margem ?? 0.6}
            ovosEsperadosAteHoje={custoOvo?.ovosEsperadosAteHoje || 0}
            semanasPostura={custoOvo?.semanasPostura || 0}
            totalOvosProduzidos={dadosRelogio?.totalOvosProduzidos || 0}
          />
        </View>
      </View>

      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuAberto(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuAberto(false)}
        >
          <View
            style={[styles.menuBox, { top: insets.top + 52, right: 12 }]}
          >
            <View style={styles.menuUser}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.menuAvatar}
                />
              ) : (
                <View style={[styles.menuAvatar, styles.avatarFallback]}>
                  <Ionicons name="person" size={20} color="#666" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.menuNome} numberOfLines={1}>
                  {user?.displayName || 'Usuário'}
                </Text>
                <Text style={styles.menuEmail} numberOfLines={1}>
                  {user?.email || ''}
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              onPress={handleSair}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: '#fdf2f2' },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#c0392b" />
              <Text style={[styles.menuItemTexto, { color: '#c0392b' }]}>
                Sair
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    width: 230,
    height: 60,
    marginLeft: 14,
  },
  headerRightBtn: {
    marginRight: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuBox: {
    position: 'absolute',
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  menuUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menuNome: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#111',
  },
  menuEmail: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e8e8e8',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemTexto: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#333',
  },
});