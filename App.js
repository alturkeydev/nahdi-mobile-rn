import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

import { Icon } from "react-native-elements";

import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Button
      title="Go to Jane's profile"
      onPress={() => navigation.navigate("Profile", { name: "Jane" })}
    />
    <Text style={styles.fontc}>Welcome to font! n nn n</Text>
    </View>
  );
};
const ProfileScreen = ({ navigation, route }) => {
  return <Text>This is {route.params.name}'s profile</Text>;
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home nahdi"
          component={HomeScreen}
          options={{
            headerTintColor: "#42bdb3",
            headerRight: () => (
              <Icon
                name="shopping-cart"
                type="font-awesome"
                color="#42bdb3"
                containerStyle={styles.iconcontainer}
                onPress={() => console.log("hello")}
              />
            ),
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerTintColor: "#42bdb3",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fontc: {
    fontFamily: 'MADTypeVariableBlack'
  },
  iconcontainer: {
    paddingRight: 15,
  },
});
