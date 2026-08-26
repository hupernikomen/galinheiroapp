import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '../pages/Home'
import Lote from '../pages/Lote'
import Info from '../pages/Info'

const Stack = createNativeStackNavigator()

export default function StackRotas() {
  return (
    <Stack.Navigator>

      <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
      <Stack.Screen name='Lote' component={Lote} options={{ title: "Registro de Lotes" }} />
      <Stack.Screen name='Info' component={Info} options={{  }} />

    </Stack.Navigator>
  )
}