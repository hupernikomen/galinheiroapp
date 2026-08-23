import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '../pages/Home'

const Stack = createNativeStackNavigator()

export default function StackRotas() {
  return (
    <Stack.Navigator screenOptions={{
      contentStyle: {
        backgroundColor: '#fff'
      },
      
    }}>

      <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />

    </Stack.Navigator>
  )
}