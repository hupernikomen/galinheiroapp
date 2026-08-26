import { useTheme } from '@react-navigation/native';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TabbarPersonalizada({ state, descriptors, navigation }) {

  const { colors } = useTheme()

  return (
    <View style={styles.container}>

      <View style={[styles.content, { backgroundColor: colors.neutro }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true
            })

            if (!isFocused && !event.canPreventDefault) {
              navigation.navigate(route.name, {}, { merge: true })
            }
          }

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key
            })
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole='button'
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.buttonTab}
            >

              <View style={{ alignItems: "center", padding: 2, }}>
                <View style={{ padding: 14, backgroundColor: isFocused ? '#ff0000' : '#ffffffff', borderRadius: 30, elevation: isFocused ? 5 : 0 }}>

                  <Ionicons name={options.tabBarIcon} size={24} color={isFocused ? "#fff" : '#00000035'} />

                </View>
              </View>

            </TouchableOpacity>
          )
        })}
      </View>
    </View>

  );


}

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'blue'

  },
  content: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: "center",
    position: "absolute",
    marginBottom: 28,
    bottom: 0,
    padding: 4,
    borderRadius: 35,
  },
  buttonTab: {
    alignItems: "center",
    justifyContent: "center",

  }
})