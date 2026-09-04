import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@react-navigation/native';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_SIZE = 56; // área de cada aba
const PILL_SIZE = 54; // bolinha da cor principal

export default function TabbarPersonalizada({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const slideX = useRef(new Animated.Value(state.index * TAB_SIZE)).current;
  const scales = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  // layouts medidos de cada aba (para o pill seguir o centro real)
  const [layouts, setLayouts] = useState({});

  useEffect(() => {
    // desliza a cor principal até a aba focada
    const layout = layouts[state.index];
    const toX = layout
      ? layout.x + layout.width / 2 - PILL_SIZE / 2
      : state.index * TAB_SIZE + (TAB_SIZE - PILL_SIZE) / 2;

    Animated.spring(slideX, {
      toValue: toX,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();

    // cresce o ícone focado e reduz os outros
    scales.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 140,
      }).start();
    });
  }, [state.index, layouts]);

  function onLayoutTab(index, e) {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      if (prev[index]?.x === x && prev[index]?.width === width) return prev;
      return { ...prev, [index]: { x, width } };
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.neutro }]}>
        {/* Bolinha que desliza (cor principal) */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              backgroundColor: colors.principal,
              transform: [{ translateX: slideX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const scale = scales[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.10],
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) return;
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={(e) => onLayoutTab(index, e)}
              style={styles.buttonTab}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.iconWrap,
                  { transform: [{ scale }] },
                ]}
              >
                <Ionicons
                  name={options.tabBarIcon}
                  size={20}
                  color={isFocused ? '#fff' : "#333"}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -10,
    marginBottom: 28,
    padding: 4,
    borderRadius: 35,
  },
  pill: {
    position: 'absolute',
    left: -1,
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    zIndex: 0,
  },
  buttonTab: {
    width: TAB_SIZE,
    height: TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: PILL_SIZE,
    height: PILL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});