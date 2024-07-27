import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as RNOverlay from '@marqroldan/react-native-overlay';

function HomeScreen() {
  return (
      <View style={styles.container}>
        <Text>Home Screen</Text>
      </View>
  );
}


const Stack = createNativeStackNavigator();

function App() {
  return (
      <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer></View>
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
