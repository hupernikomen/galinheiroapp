// import { useState } from 'react';
// import { Text, Pressable, StyleSheet, Platform } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useTheme } from '@react-navigation/native';

// export default function SeletorData({ data, setData }) {
//   const { colors } = useTheme();
//   const [mostrar, setMostrar] = useState(false);

//   function abrir() {
//     setMostrar(false);
//     setTimeout(() => setMostrar(true), 50);
//   }

//   function onValueChange(event, selectedDate) {
//     if (Platform.OS === 'android') {
//       setMostrar(false);
//     }
//     if (event?.type === 'dismissed') {
//       setMostrar(false);
//       return;
//     }
//     if (selectedDate) {
//       setData(selectedDate);
//     }
//   }

//   return (
//     <>
//       <Pressable onPress={abrir} style={styles.botao}>
//         <Text style={styles.texto}>
//           {(data || new Date()).toLocaleDateString('pt-BR')}
//         </Text>
//         <Ionicons
//           name="calendar-outline"
//           size={24}
//           color={colors.principal || '#B22222'}
//         />
//       </Pressable>

//       {mostrar && (
//         <DateTimePicker
//           value={data || new Date()}
//           mode="date"
//           display="default"
//           onValueChange={onValueChange}
//           onDismiss={() => setMostrar(false)}
//         />
//       )}
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   botao: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: 50,
//     borderRadius: 22,
//     paddingHorizontal: 16,
//     backgroundColor: '#22222215',
//     marginBottom: 12,
//   },
//   texto: {
//     fontSize: 16,
//     color: '#333',
//   },
// });