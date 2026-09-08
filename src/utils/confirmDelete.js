// import { Alert } from 'react-native';
// import { deleteDoc, doc } from 'firebase/firestore';
// import { db } from '../services/firebaseConnection/firebase';

// /**
//  * @param {string} colecao - nome da coleção Firestore
//  * @param {string} id - id do documento
//  * @param {string} titulo - título do Alert
//  * @param {string} mensagem - corpo do Alert
//  */
// export function confirmDelete(colecao, id, titulo, mensagem) {
//   Alert.alert(titulo, mensagem, [
//     { text: 'Cancelar', style: 'cancel' },
//     {
//       text: 'Excluir',
//       style: 'destructive',
//       onPress: async () => {
//         try {
//           await deleteDoc(doc(db, colecao, id));
//         } catch (e) {
//           console.log(e);
//           Alert.alert('Erro', 'Não foi possível excluir');
//         }
//       },
//     },
//   ]);
// }