import {
  OverlayController,
  Holder,
  DisplayHolderStackRenderer,
  DisplayHolderScrim,
} from "@marqroldan/react-native-overlay";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View, Button } from "react-native";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Holder name="root">
        <View style={{ flex: 1, paddingVertical: 20 }}>
          <Text>Root</Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Holder name="child1">
              <View style={{ flex: 1, backgroundColor: "brown" }}>
                <Text>Child 1</Text>
                <DisplayHolderStackRenderer />
              </View>
            </Holder>
            <Holder name="child2">
              <View style={{ flex: 1, backgroundColor: "green" }}>
                <Text>Child 2</Text>
                <DisplayHolderScrim />
                <DisplayHolderStackRenderer />
              </View>
            </Holder>
          </View>
          <Text>Root</Text>
          <DisplayHolderStackRenderer />
        </View>
      </Holder>
      <View style={{ height: 50, flexDirection: "row", zIndex: 999, }}>
        <Button title="Root"
                onPress={() => {
                  console.log("i am working")
                  OverlayController.show("nonexistent node", {
                    showStackScrim: true,
                    component: () => (
                      <View
                        style={{ width: 300, height: 300, backgroundColor: "red" }}
                      />
                    ),
                  });
                }}  />
        <Button title="Child 1"
                onPress={() => {
                  console.log("i am working")
                  OverlayController.show("child1", {
                    showStackScrim: true,
                    component: () => (
                      <View
                        style={{ width: 100, height: 100, backgroundColor: "yellow" }}
                      />
                    ),
                  });
                }} />
        <Button
          title="Child 2"
          onPress={() => {
            console.log("i am working")
            OverlayController.show("child2", {
              showStackScrim: true,
              component: () => (
                <View
                  style={{ width: 100, height: 100, backgroundColor: "red" }}
                />
              ),
            });
          }}
        />
      </View>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <OverlayController>
      <View style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </OverlayController>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
