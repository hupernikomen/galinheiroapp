import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Tabs from './tabs';
import Coleta from '../pages/Ovos/coleta';
import Custos from '../pages/Custos'
import NovoCusto from '../pages/Custos/novoCusto';
import Lote from '../pages/Lote'
import NovoLote from '../pages/Lote/novoLote';
import Investimentos from '../pages/Investimentos';
import NovoInvestimento from '../pages/Investimentos/novoInvestimento';
import Marcos from '../pages/Marcos';
import NovoMarco from '../pages/Marcos/novoMarco';
import EstoqueRacao from '../pages/EstoqueRacao';
import NovoEstoqueRacao from '../pages/EstoqueRacao/novoEstoque';
import Baixas from '../pages/Baixas';
import NovaBaixa from '../pages/Baixas/NovaBaixa';


const Stack = createNativeStackNavigator();

export default function Rotas() {
  return (
    <Stack.Navigator screenOptions={{
      headerTitleStyle: {
        fontSize: 18,
        fontFamily: 'Roboto-Bold',
      }
    }}>
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{
          headerShown: false,

        }}
      />

      <Stack.Screen name="Baixas" component={Baixas} options={{ title: 'Baixas' }} />
      <Stack.Screen name="NovaBaixa" component={NovaBaixa} options={{ title: 'Nova baixa' }} />
      <Stack.Screen name="NovoEstoqueRacao" component={NovoEstoqueRacao} options={{ title: 'Estoque de ração' }} />
      <Stack.Screen name="EstoqueRacao" component={EstoqueRacao} options={{ title: 'Estoque de ração' }} />
      <Stack.Screen name="NovoCusto" component={NovoCusto} options={{ title: 'Novo custo' }} />
      <Stack.Screen name="Coleta" component={Coleta} options={{ title: 'Nova coleta' }} />
      <Stack.Screen name="Custos" component={Custos} options={{ title: 'Custos' }} />
      <Stack.Screen name="Lote" component={Lote} options={{ title: 'Lote' }} />
      <Stack.Screen name="NovoLote" component={NovoLote} options={{ title: 'Registrar novo lote' }} />
      <Stack.Screen name="Investimentos" component={Investimentos} options={{ title: 'Investimentos' }} />
      <Stack.Screen name="NovoInvestimento" component={NovoInvestimento} options={{ title: 'Novo investimento' }} />
      <Stack.Screen name="Marcos" component={Marcos} options={{ title: 'Marcos do lote' }} />
      <Stack.Screen name="NovoMarco" component={NovoMarco} options={{ title: 'Novo marco' }} />
    </Stack.Navigator>
  );
}