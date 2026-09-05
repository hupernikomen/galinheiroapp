import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebaseConnection/firebase'; // ajuste o caminho se for outro

// Web client ID do google-services.json (client_type: 3)
const WEB_CLIENT_ID =
  '783209694901-811cp5sblto7e9mvrl1snrig2142aus0.apps.googleusercontent.com';

export function configurarGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export async function entrarComGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  const idToken = response?.data?.idToken ?? response?.idToken;

  if (!idToken) {
    throw new Error('Não foi possível obter o idToken do Google');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user; // { uid, email, displayName, photoURL, ... }
}

export async function sairDaConta() {
  try {
    await GoogleSignin.signOut();
  } catch (e) {}
  await firebaseSignOut(auth);
}