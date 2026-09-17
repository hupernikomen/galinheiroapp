import { StyleSheet, View, Pressable, Text, Image, Modal, Alert } from 'react-native';
import { AppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';


<<<<<<< HEAD
import { MENU } from '../../constants/menulist';

import Ciclo from '../../componentes/Ciclo';
import InfoHome from '../../componentes/InfoHome';

=======
const ALTURA_TABBAR = 78;
>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac

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


<<<<<<< HEAD
=======
  const ITENS = [
    {
      lista: [
        {
          titulo: 'Lotes',
          subtitulo: 'Cadastro e gestão dos lotes',
          rota: 'Lote',
        },
        {
          titulo: 'Investimentos',
          subtitulo: 'Galpão, equipamentos e depreciação',
          rota: 'Investimentos',
        },
        {
          titulo: 'Estoque de ração',
          subtitulo: 'Compras e saldo em kg',
          rota: 'EstoqueRacao',
        },
        {
          titulo: 'Baixas',
          subtitulo: 'Dar baixas em galinhas mortas ou vendidas',
          rota: 'Baixas',
        },
      ],
    },
    {
      secao: 'Ciclo e ajuda',
      lista: [
        {
          titulo: 'Marcos do ciclo',
          subtitulo: 'Alertas e fases do relógio',
          rota: 'Marcos',
        },
      ],
    },
  ];
>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac

  useEffect(() => {
    navigation.setOptions({

      headerRight: () => (
        <Pressable
          onPress={() => setMenuAberto(true)}
          style={{ marginRight: 16 }}
        >
<<<<<<< HEAD

          <Ionicons
            name="menu-outline"
            size={22}
          />
=======
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <Ionicons name="menu" size={28} />
          </View>

>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac
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
    navigation.navigate(rota);
    setMenuAberto(false)
  }

  return (
    <View style={styles.container}>


<<<<<<< HEAD
      <View style={styles.main}>
        <Ciclo />
        <InfoHome />
=======
      <View style={[styles.main]}>
        <View style={styles.cicloWrap}>
          <Ciclo />
        </View>

        {/* InfoHome ocupa o restante até o fim */}
        <View style={styles.infoWrap}>
          <InfoHome />
        </View>
>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac
              </View>

              {/* <View style={styles.menuDivider} /> */}

              <Pressable style={styles.menuItem} onPress={handleSair}>
                <Ionicons name="log-out-outline" size={20} />
                <Text style={styles.menuItemTexto}>
                  Sair
                </Text>
              </Pressable>
              <View style={styles.menuDivider} />

              {ITENS.map((bloco, index) => (
                <View key={index} style={styles.bloco}>

                  <View style={styles.listaCard}>
                    {bloco.lista.map((item, index) => (
                      <View key={index}>
                        <Pressable
                          onPress={() => irPara(item.rota)}
                          style={styles.menuItem}
                        >
                          <Text style={styles.menuItemTexto}>{item.titulo}</Text>
                        </Pressable>
                        <View style={styles.menuDivider} />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
<<<<<<< HEAD


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
                    <Pressable
                      key={index}
                      onPress={() => irPara(item.rota)}
                      style={styles.menuItem}
                      >
                        <Text style={styles.menuItemTexto}>{item.titulo}</Text>
                    </Pressable>
                  ))}
                  <View style={styles.menuDivider} />
                </View>
              </View>
            ))}
          </View>
        </Pressable>
=======
          </Pressable>
>>>>>>> 2e9f5f8005f0b04bfcac6891a42040c5a15bf9ac
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  main: {
    flex: 1,
    paddingHorizontal: 18,
  },
  cicloWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoWrap: {
    flex: 1,
    width: '100%',
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
    elevation: 10,
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
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuItemTexto: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
});