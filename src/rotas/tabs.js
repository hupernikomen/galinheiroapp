import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabbarPersonalizada from '../componentes/TabbarPersonalizada';

import Home from '../pages/Home';
import Ovos from '../pages/Ovos';
import Menu from '../pages/Menu';

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
          headerTitleStyle:{
            fontSize:18,
            fontFamily:'Roboto-Bold',
            marginLeft:14
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{ tabBarIcon: 'home-outline', headerShown: true, title: '', headerShadowVisible:false, }}
        />
        <Tab.Screen
          name="Ovos"
          component={Ovos}
          options={{
            headerShown: true,
            tabBarIcon: 'egg-outline',
            headerRightContainerStyle: {
              paddingRight: 16
            }
          }}
        />
        <Tab.Screen
          name="Menu"
          component={Menu}
          options={{
            headerShown: true,
            tabBarIcon: 'menu-outline',
          }}
        />

      </Tab.Navigator>
    </SafeAreaView>
  );
}