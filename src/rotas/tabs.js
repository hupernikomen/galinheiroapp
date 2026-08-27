import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StackRotas from './stacks'
import Custos from '../pages/Custos'
import Ovos from '../pages/Ovos'
import { CommonActions } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context';

import TabbarPersonalizada from '../componentes/TabbarPersonalizada'

const Tab = createBottomTabNavigator();

export default function Rotas() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <TabbarPersonalizada {...props} />}
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            margin: 22,
            backgroundColor: 'red',
            padding: 14,
            borderWidth: 0,
            borderRadius: 14
          }
        }}
      >
        <Tab.Screen
          name="HomeStack"
          component={StackRotas}
          options={{ tabBarIcon: 'home-outline', headerShown: false }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              // Se já estiver nesta aba, reseta a stack para a Home
              const state = navigation.getState();
              const tab = state.routes.find((r) => r.key === route.key);

              if (tab?.state && tab.state.index > 0) {
                e.preventDefault();
                navigation.dispatch({
                  ...CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Home' }], // nome da tela inicial do Stack
                  }),
                  target: tab.state.key,
                });
              }
            },
          })}
        />
        <Tab.Screen name="Ovos" component={Ovos} options={{ title: 'Registros de Coleta de Ovos', tabBarIcon: 'egg-outline' }} />
        <Tab.Screen name="Custos" component={Custos} options={{ title: "Custos Diários", tabBarIcon: "shapes-outline", }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
