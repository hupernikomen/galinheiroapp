import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBar from '../componentes/TabBar';

import Home from '../pages/Home';
import Ovos from '../pages/Ovos';
import Custos from '../pages/Custos';

const Tab = createBottomTabNavigator();


// import { TabBarVisibilityProvider } from '../contexts/TabBarVisibility';



export default function Tabs() {
  return (

    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      {/* <TabBarVisibilityProvider> */}

        <Tab.Navigator
          initialRouteName='Home'
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            headerTitleStyle: {
              fontSize: 18,
              fontFamily: 'Roboto-Bold',
              marginLeft: 14,
            }
          }}>

          <Tab.Screen
            name="Home"
            component={Home}
            options={{
              tabBarIcon: 'home-outline',
              headerShown: true,
              title: '',
              headerShadowVisible: false
            }}
          />

          <Tab.Screen
            name="Ovos"
            component={Ovos}
            options={{
              headerShown: true,
              tabBarIcon: 'egg-outline',
              headerRightContainerStyle: {
                paddingRight: 16,
              }
            }}
          />

          <Tab.Screen
            name="Custos"
            component={Custos}
            options={{
              headerShown: true,
              tabBarIcon: 'wallet-outline',
              headerRightContainerStyle: {
                paddingRight: 16,
              }
            }}
          />

        </Tab.Navigator>
      {/* </TabBarVisibilityProvider> */}

    </SafeAreaView>
  );
}