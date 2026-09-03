import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabbarPersonalizada from '../componentes/TabbarPersonalizada';

import Home from '../pages/Home';
import Ovos from '../pages/Ovos';
import Custos from '../pages/Custos';

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
          name="Home"
          component={Home}
          options={{ tabBarIcon: 'home-outline', headerShown: true, title:'Meu Galinheiro' }}
        />
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

      </Tab.Navigator>
    </SafeAreaView>
  );
}