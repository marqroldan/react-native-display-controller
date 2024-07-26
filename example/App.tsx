import { StyleSheet, Text, View } from 'react-native';

import * as RNOverlay from '@marqroldan/react-native-overlay';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{RNOverlay.hello()}</Text>
    </View>
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
