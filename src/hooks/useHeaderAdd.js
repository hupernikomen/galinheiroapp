import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function useHeaderAdd(nomeTela, title) {
  const navigation = useNavigation();

  const { colors } = useTheme()

  useEffect(() => {
    navigation.setOptions({
      ...(title ? { title } : {}),
      headerRight: () => (
        <Pressable
          onPress={() => {
            // Tab screen → Tab navigator → Stack raiz
            const root =
              navigation.getParent()?.getParent?.() ||
              navigation.getParent?.() ||
              navigation;

            root.navigate(nomeTela);
          }}
          style={{backgroundColor: colors.neutro, padding:10, borderRadius:6 }}
        >
          <Ionicons name="add" size={22} color="#000" />
        </Pressable>
      ),
    });
  }, [navigation, nomeTela, title]);
}