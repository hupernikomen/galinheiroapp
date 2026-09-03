import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Tabs from './tabs';
import Coleta from '../pages/Ovos/coleta';
import NovoCusto from '../pages/Custos/novoCusto';
import NovoLote from '../pages/Lote/novoLote';
import NovoInvestimento from '../pages/Investimentos/novoInvestimento';
import Marcos from '../pages/Marcos';
import NovoMarco from '../pages/Marcos/novoMarco';
import Info from '../pages/Info'; // se existir
import Menu from '../pages/Menu'

const Stack = createNativeStackNavigator();

export default function Rotas() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Coleta" component={Coleta} options={{ title: 'Nova coleta' }} />
      <Stack.Screen name="NovoCusto" component={NovoCusto} options={{ title: 'Novo custo' }} />
      <Stack.Screen name="NovoLote" component={NovoLote} options={{ title: 'Novo lote' }} />
      <Stack.Screen name="NovoInvestimento" component={NovoInvestimento} options={{ title: 'Novo investimento' }} />
      <Stack.Screen name="Marcos" component={Marcos} options={{ title: 'Marcos do lote' }} />
      <Stack.Screen name="NovoMarco" component={NovoMarco} options={{ title: 'Novo marco' }} />
      <Stack.Screen name="Info" component={Info} options={{ title: 'Como funciona' }} />
      <Stack.Screen name="Menu" component={Menu} options={{  }} />
    </Stack.Navigator>
  );
}