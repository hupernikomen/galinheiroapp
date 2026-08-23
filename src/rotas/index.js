import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

import StackRotas from './stacks'
import Ovos from '../pages/Ovos'
import Lote from '../pages/Lote'
import Custos from '../pages/Custos'


import { SafeAreaView } from 'react-native-safe-area-context';

import TabbarPersonalizada from '../componentes/TabbarPersonalizada'


const Tab = createBottomTabNavigator();

export default function Rotas() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
      tabBar={(props) => <TabbarPersonalizada {...props}/>}
        screenOptions={{
          tabBarShowLabel: false,
          headerShown:false,
          tabBarStyle:{
            position:'absolute',
            margin:22, 
            backgroundColor:'red',
            padding:14,
            borderWidth:0,
            borderRadius:14
          }
        }}
      >
        <Tab.Screen name="HomeStack" component={StackRotas} options={{tabBarIcon: "egg-outline"}} />
        {/* <Tab.Screen name="Ovos" component={Ovos} options={{tabBarIcon: "bag-outline"}} /> */}
        <Tab.Screen name="Custos" component={Custos} options={{ tabBarIcon: "repeat"}} />
        <Tab.Screen name="Lote" component={Lote} options={{tabBarIcon: "umbrella-outline"}} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
