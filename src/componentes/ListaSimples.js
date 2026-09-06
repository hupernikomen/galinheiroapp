// import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
// import { useTheme } from '@react-navigation/native';

// export default function ListaSimples({
//   data = [],
//   loading = false,
//   keyExtractor,
//   renderItem,
//   ListEmptyComponent,
//   ListHeaderComponent,
//   contentContainerStyle,
// }) {
//   const { colors } = useTheme();

//   if (loading) {
//     return (
//       <View style={styles.loading}>
//         <ActivityIndicator color="red" />
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={data}
//       keyExtractor={keyExtractor || ((item) => item.id)}
//       renderItem={renderItem}
//       showsVerticalScrollIndicator={false}
//       ListHeaderComponent={ListHeaderComponent}
//       ItemSeparatorComponent={
//         <View
//           style={{
//             borderColor: colors.neutro || '#22222255',
//             borderBottomWidth: 1,
//             marginVertical: 14,
//           }}
//         />
//       }
//       contentContainerStyle={[
//         { paddingBottom: 100, paddingTop: 21 },
//         contentContainerStyle,
//       ]}
//       ListEmptyComponent={
//         ListEmptyComponent || (
//           <Text style={styles.vazio}>Nenhum item</Text>
//         )
//       }
//     />
//   );
// }

// const styles = StyleSheet.create({
//   loading: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   vazio: {
//     textAlign: 'center',
//     marginTop: 30,
//     color: '#999',
//   },
// });