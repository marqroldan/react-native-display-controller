import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import * as RNOverlay from '@marqroldan/react-native-overlay';

export default function App() {
  return (<NavigationContainer>
    <View style={styles.container}>
      <Text><RNOverlay.Hello/></Text>
    </View>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
