import { AppState } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebaseConnection/firebase';

const WEB_CLIENT_ID =
  '783209694901-811cp5sblto7e9mvrl1snrig2142aus0.apps.googleusercontent.com';

export function configurarGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

function esperarAppAtivo() {
  if (AppState.currentState === 'active') return Promise.resolve();

  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

export async function entrarComGoogle() {
  // 1) garante que o app está em foreground
  await esperarAppAtivo();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // 2) limpa sessão antiga do Google (evita estado estranho)
  try {
    const atual = await GoogleSignin.getCurrentUser();
    if (atual) {
      await GoogleSignin.signOut();
    }
  } catch (e) {
    // ignore
  }

  // 3) abre o login
  const response = await GoogleSignin.signIn();
  const idToken = response?.data?.idToken ?? response?.idToken;

  if (!idToken) {
    throw new Error('Não foi possível obter o idToken do Google');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function sairDaConta() {
  try {
    await GoogleSignin.signOut();
  } catch (e) {}
  await firebaseSignOut(auth);
}