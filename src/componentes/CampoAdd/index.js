// import { useState, useContext, useEffect } from 'react';
// import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { GeralContext } from '../../contexts/geral';
// import { db } from '../../services/firebaseConnection/firebase'

// import { collection, addDoc } from "firebase/firestore"


// export default function CampoAdd({ data = null, setData, qt, setQt }) {


//   const { lote } = useContext(GeralContext);

//   const [mostrarData, setMostrarData] = useState(false);

//   function onValueChange(event, selectedDate) {
//     if (event.type === 'dismissed') {
//       setMostrarData(false);
//       return;
//     }

//     setMostrarData(Platform.OS === 'ios');
//     if (selectedDate) {
//       setData(selectedDate);
//     }
//   }


//   async function CadastrarColeta() {

//     if (!qt) {
//       return
//     }

//     if (!lote) {
//       Alert.alert('Selecione um lote');
//       return;
//     }

//     Alert.alert(
//       '',
//       `Confirma a coleta de ${qt} ovos na data de ${data.toLocaleDateString()}`,
//       [
//         { text: 'Não', style: 'cancel' },
//         {
//           text: 'Sim',
//           onPress: async () => {
//             try {
//               addDoc(collection(db, "coletaOvos"), {
//                 data: Date.now(),
//                 loteId: lote.id,
//                 qt: Number(qt)
//               })

//             } catch (error) {

//               console.log("Erro: " + err);
//             } finally {

//               setQt(0)
//               setData(null)
//             }


//           }
//         },
//       ]
//     );

//   }

//   return (
//     <View style={{ flexDirection: 'row', marginTop: 14, marginBottom: 28 }}>

//       <View style={styles.inputComBotao}>
//         {!!data?.toLocaleDateString() ? <TextInput
//           maxLength={3}
//           placeholder="0 coleta"
//           style={styles.input}
//           keyboardType="numeric"
//           value={qt}
//           onChangeText={setQt}
//         /> : null
//         }

//         <Pressable onLongPress={() => setMostrarData(true)} onPress={() => {
//           !!data?.toLocaleDateString() ? CadastrarColeta() : setMostrarData(true)

//         }} style={[styles.botaoInput, { backgroundColor: !!qt ? '#ffe5e5b7' : '#22222215' }]}>
//           {!!data?.toLocaleDateString() ? <View style={{ position: 'absolute', top: 0, left: -6, backgroundColor: 'red', borderRadius: 10, aspectRatio: 1, width: 18, justifyContent: "center" }}>
//             <Text style={{ color: '#fff', fontSize: 10, alignSelf: 'center' }}>{data?.toLocaleDateString().slice(0, 2)}</Text>
//           </View> : null}
//           <Ionicons name={!data?.toLocaleDateString() ? "calendar-outline" : "add"} size={24} color="red" />
//         </Pressable>
//       </View>


//       {mostrarData && (
//         <DateTimePicker
//           value={data || new Date()}
//           mode="date"
//           display="default"
//           onValueChange={onValueChange}
//           onDismiss={() => setMostrarData(false)}
//         />
//       )}
//     </View>
//   );
// }


// const styles = StyleSheet.create({

//   inputComBotao: {
//     height: 60,
//     width: '100%',
//     flexDirection: 'row',
//     alignContent: 'center',
//     justifyContent: 'flex-end',
//     borderRadius: 30,
//     padding: 8,
//   },
//   input: {
//     flex: 1,
//     height: 48,
//     fontSize: 16,
//     backgroundColor: '#22222215',
//     borderRadius: 50,
//     paddingHorizontal: 21
//   },

//   botaoInput: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 6
//   },
// });