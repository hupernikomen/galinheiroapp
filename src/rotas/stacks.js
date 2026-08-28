import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '../pages/Home'
import Lote from '../pages/Lote'
import Info from '../pages/Info'
import Coleta from '../pages/Ovos/coleta'
import Marcos from '../pages/Marcos'
import NovoMarco from '../pages/Marcos/novoMarco'
import Menu from '../pages/Menu'
import NovoCusto from '../pages/Custos/novoCusto'
import NovoInvestimento from '../pages/Investimentos/novoInvestimento'
import NovoLote from '../pages/Lote/novoLote'

const Stack = createNativeStackNavigator()

export default function StackRotas() {
  return (
    <Stack.Navigator>

      <Stack.Screen name='Home' component={Home} options={{ headerShown: false }} />
      <Stack.Screen name='Lote' component={Lote} options={{ title: "Registro de Lotes" }} />
      <Stack.Screen name='Info' component={Info} options={{}} />
      <Stack.Screen name="Coleta" component={Coleta} />
      <Stack.Screen name="Marcos" component={Marcos} />
      <Stack.Screen name="NovoMarco" component={NovoMarco} options={{title: 'Novo Marco'}} />
      <Stack.Screen name="NovoInvestimento" component={NovoInvestimento} options={{title: 'Novo Investimento'}} />
      <Stack.Screen name="NovoLote" component={NovoLote} options={{title: 'Novo Lote'}} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen
        name="NovoCusto"
        component={NovoCusto}
        options={{ title: 'Novo custo' }}
      />


    </Stack.Navigator>
  )
}