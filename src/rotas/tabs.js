import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabbarPersonalizada from '../componentes/TabbarPersonalizada';

import Home from '../pages/Home';
import Ovos from '../pages/Ovos';
import Custos from '../pages/Custos';
import Investimentos from '../pages/Investimentos';
import Lote from '../pages/Lote';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <Tab.Navigator
      initialRouteName='Home'
        tabBar={(props) => <TabbarPersonalizada {...props} />}
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Ovos"
          component={Ovos}
          options={{
            headerShown: true,
            tabBarIcon: 'egg-outline',
          }}
        />
        <Tab.Screen
          name="Custos"
          component={Custos}
          options={{
            headerShown: true,
            tabBarIcon: 'card-outline',
          }}
        />
          <Tab.Screen
            name="Home"
            component={Home}
            options={{ tabBarIcon: 'home-outline', headerShown: true, title:'Meu Galinheiro' }}
          />
        <Tab.Screen
          name="Investimentos"
          component={Investimentos}
          options={{
            headerShown: true,
            tabBarIcon: 'storefront-outline',
          }}
        />
        <Tab.Screen
          name="Lote"
          component={Lote}
          options={{
            headerShown: true,
            tabBarIcon: 'cube-outline',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}