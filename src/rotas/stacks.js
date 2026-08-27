import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '../pages/Home'
import Lote from '../pages/Lote'
import Info from '../pages/Info'
import Coleta from '../pages/Ovos/coleta'
import Marcos from '../pages/Marco'
import Menu from '../pages/Menu'

const Stack = createNativeStackNavigator()

export default function StackRotas() {
  return (
    <Stack.Navigator>

      <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
      <Stack.Screen name='Lote' component={Lote} options={{ title: "Registro de Lotes" }} />
      <Stack.Screen name='Info' component={Info} options={{  }} />
      <Stack.Screen name="Coleta" component={Coleta} />
      <Stack.Screen name="Marcos" component={Marcos} />
      <Stack.Screen name="Menu" component={Menu} />

    </Stack.Navigator>
  )
}