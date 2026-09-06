import { StatusBar, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useContext } from 'react';

import AuthProvider, { AuthContext } from './src/contexts/AuthContext';
import GeralProvider, { GeralContext } from './src/contexts/geral';
import Rotas from './src/rotas';
import Login from './src/pages/Login';
import TelaCarregamento from './src/componentes/TelaCarregamento';

const Tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
    principal: '#66796b',
    neutro: '#efdfcc99',
    destaque: '#d7a184'
  },
};

function AppNavigator() {
  const { user, authPronto } = useContext(AuthContext);
  const { appPronto } = useContext(GeralContext);

  if (!authPronto) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#66796b" />
      </View>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <NavigationContainer theme={Tema}>
      <StatusBar barStyle="dark-content" />
      {appPronto ? <Rotas /> : <TelaCarregamento />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GeralProvider>
          <AppNavigator />
        </GeralProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}