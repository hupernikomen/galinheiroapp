import { StyleSheet, Text, View } from 'react-native';

export default function Info(titulo = "", texto = "") {
  return (
    <View style={styles.container}>
      <Text>{titulo}</Text>
      <Text>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems:"center",
    justifyContent:'center'
  }, 
  titulo: {
    fontFamily:"Roboto-Bold",
    fontSize: 22
  }

})