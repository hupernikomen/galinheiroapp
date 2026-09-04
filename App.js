// import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import GeralProvider, { GeralContext } from './src/contexts/geral';

import Rotas from './src/rotas'
import TelaCarregamento from './src/componentes/TelaCarregamento';
import { useContext } from 'react';

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
    principal: '#66796b',
    neutro: '#efdfcc'
  },
};






function AppNavigator() {
  const { appPronto } = useContext(GeralContext);

  return (
    <NavigationContainer theme={Tema}>
      <StatusBar barStyle="dark-content" />
      {appPronto ? <Rotas /> : <TelaCarregamento />}
    </NavigationContainer>
  );
}



export default function App() {
  return (
    <GeralProvider>
      <AppNavigator />
    </GeralProvider>
  );
}
