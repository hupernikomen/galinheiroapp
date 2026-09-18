import { StyleSheet, View, Pressable, Text, Image, Modal, Alert } from 'react-native';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import Ciclo from '../../componentes/Ciclo';
import InfoHome from '../../componentes/InfoHome';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MENU } from '../../constants/menuList';


export default function Home() {
  const {
    lote,
    setLote,
    listaLotes,
  } = useContext(AppContext);
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [menuAberto, setMenuAberto] = useState(false);


  useEffect(() => {
    navigation.setOptions({

      headerRight: () => (
        <Pressable
          onPress={() => setMenuAberto(true)}
          style={{ marginRight: 16 }}
        >

          <Ionicons
            name="menu"
            size={26}
          />
        </Pressable>
      ),
    });
  }, [navigation, listaLotes, lote, setLote, user, colors]);

  async function handleSair() {
    setMenuAberto(false);
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  }

  function irPara(rota) {
    navigation.navigate(rota)
    setMenuAberto(false)
  }

  return (
    <View style={styles.container}>


      <View style={styles.main}>
        <Ciclo />
        <InfoHome />
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
            style={[styles.menuBox, { top: insets.top + 48, right: 12 }]}
          >
            <View style={styles.menuUser}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.menuAvatar}
                />
              ) : (
                <Ionicons name="person-circle" size={40} color="#999" />
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


            <Pressable style={styles.menuItem} onPress={handleSair}>
              <Text style={styles.menuItemTexto}>
                Sair
              </Text>
            </Pressable>
            <View style={styles.menuDivider} />

            {MENU.map((bloco, index) => (
              <View key={index} style={styles.bloco}>

                <View style={styles.listaCard}>
                  {bloco.lista.map((item, index) => (
                    <>
                    <Pressable
                      key={index}
                      onPress={() => irPara(item.rota)}
                      style={styles.menuItem}
                      >
                      <View style={styles.textos}>
                        <Text style={styles.menuItemTexto}>{item.titulo}</Text>
                      </View>
                    </Pressable>
                <View style={styles.menuDivider} />
                      </>
                  ))}
                </View>
              </View>
            ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    maxWidth: 220,
    justifyContent: 'center',
  },
  picker: {
    backgroundColor: '#f9f9f9',
    width: '98%',
    height: 50,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  main: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'space-evenly',
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
  },
  menuUser: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
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
  },
  menuEmail: {
    fontFamily: 'Roboto-Light',
    fontSize: 12,
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
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuItemTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
});