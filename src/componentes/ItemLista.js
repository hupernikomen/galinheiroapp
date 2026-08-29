import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/**
 * Layout padrão das listas do app
 */
export default function ItemLista({
  titulo,
  subtitulo,
  direita,
  onExcluir,
  children,
}) {
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        {!!subtitulo && <Text style={styles.sub}>{subtitulo}</Text>}
        {children}
      </View>

      <View style={styles.direita}>
        {typeof direita === 'string' ? (
          <Text style={styles.direitaTexto}>{direita}</Text>
        ) : (
          direita
        )}
        {onExcluir && (
          <Pressable onPress={onExcluir} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color="#c0392b" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
  sub: {
    fontFamily: 'Roboto-Light',
    fontSize: 13,
    color: '#222',
    marginTop: 2,
  },
  direita: {
    alignItems: 'flex-end',
    gap: 8,
  },
  direitaTexto: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: '#000',
  },
});