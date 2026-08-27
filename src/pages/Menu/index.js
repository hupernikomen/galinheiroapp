import { Pressable, View, Text } from 'react-native';

import Info from '../Info';
import { useNavigation } from '@react-navigation/native';

export default function Menu() {

  const navigation = useNavigation()

 return (
   <View>
    <View>
      <Pressable onPress={()=> navigation.navigate('Info')}>
        <Text>Info</Text>
      </Pressable>
    </View>
   </View>
  );
}