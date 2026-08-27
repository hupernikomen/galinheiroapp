import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import StackRotas from './stacks'
import Custos from '../pages/Custos'
import Ovos from '../pages/Ovos'
// import Investimentos from '../pages/Investimentos';
// import Lote from '../pages/Lote';

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
        <Tab.Screen name="HomeStack" component={StackRotas} options={{ tabBarIcon: "home-outline", headerShown: false, }} />
        <Tab.Screen name="Ovos" component={Ovos} options={{ title:'Registros de Coleta de Ovos', tabBarIcon: 'egg-outline' }} />
        <Tab.Screen name="Custos" component={Custos} options={{ title: "Custos Diários", tabBarIcon: "shapes-outline", }} />
        {/* <Tab.Screen name="Investimentos" component={Investimentos} options={{ tabBarIcon: 'storefront-outline' }}/> */}
        {/* <Tab.Screen name="Lote" component={Lote} options={{ tabBarIcon: 'cube-outline' }}/> */}
      </Tab.Navigator>
    </SafeAreaView>
  );
}
