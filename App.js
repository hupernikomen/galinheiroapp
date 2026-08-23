// import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import GeralProvider from './src/contexts/geral';

import Rotas from './src/rotas'

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

export default function App() {
  return (
    <GeralProvider>

      <StatusBar barStyle='dark-content'/>
      <NavigationContainer theme={Tema}>
       <Rotas/>
      </NavigationContainer>
    </GeralProvider>
  );
}
