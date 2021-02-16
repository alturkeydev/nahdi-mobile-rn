import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
} from "react-native";

import { Icon, Card, ListItem } from "react-native-elements";
import { useFonts } from "expo-font";
import * as Animatable from "react-native-animatable";
import { SliderBox } from "react-native-image-slider-box";


import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {

  const [loaded] = useFonts({
    MADTypeVariableBlack: require("./assets/fonts/MADTypeVariableBlack.otf"),
    NahdiBlack: require("./assets/fonts/NahdiBlack.ttf"),
  });

  if (!loaded) {
    return null;
  }

  // images: [
  //   require('./assets/images/featured1.gif'),        // Local image
  //   require('./assets/images/featured2.gif'),
  //   require('./assets/images/featured3.gif'),
  //   require('./assets/images/featured4.jpg'),
  //   require('./assets/images/featured5.gif'),
  //   require('./assets/images/featured6.gif'),
  //   require('./assets/images/featured7.jpg'),
  // ]

  return (
    <View>
      {/* <SliderBox
        // images={images}
        resizeMethod={'resize'}
        resizeMode={'cover'}
        dotColor="#42bdb3"
        imageLoadingColor="#42bdb3"
        ImageComponentStyle={{width: '97%', marginTop: 5, backgroundColor: '#fff'}}
        autoplay='true'
        circleLoop
      /> */}
      {/* <Button
        title="Go to Jane's profile"
        onPress={() => navigation.navigate("Profile", { name: "Jane" })}
      /> */}
    </View>
  );
};
const ProfileScreen = ({ navigation, route }) => {
  return <Text>This is {route.params.name}'s profile</Text>;
};

export default function App() {
  const [loaded] = useFonts({
    MADTypeVariableBlack: require("./assets/fonts/MADTypeVariableBlack.otf"),
    NahdiBlack: require("./assets/fonts/NahdiBlack.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Nahdi Mobile"
          component={HomeScreen}
          options={{
            headerTitleStyle: {
              fontFamily: "MADTypeVariableBlack",
            },
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
            headerLeft: () => (
              <TouchableOpacity>
                <Image
                  style={{ width: 30, height: 30, marginLeft: 15 }}
                  source={require("./assets/images/icon.png")}
                />
              </TouchableOpacity>
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
  text: {
    fontFamily: "MADTypeVariableBlack",
    fontSize: 18,
    color: "#fff",
  },
  iconcontainer: {
    paddingRight: 15,
  },
});
