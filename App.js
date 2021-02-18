import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";

import { Icon, SearchBar, Card } from "react-native-elements";
import { useFonts } from "expo-font";
import { SliderBox } from "react-native-image-slider-box";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Home screen
const HomeScreen = ({ navigation }) => {
  //FETCHING DATA LOGIC
  const base64 = require("base-64");
  async function searchAPI() {
    try {
      const searchTerm = "panadol";
      const username = "alturkey.ya";
      const password = "Ya@123456";

      const headers = new Headers();
      headers.append(
        "Authorization",
        "Basic " + base64.encode(`${username}:${password}`)
      );

      console.log("searchTerm: " + searchTerm);
      const resData = await fetch(
        `https://int.nahdi.sa/soa-infra/resources/default/ChatbotProductSearch!1.0/Search?Medicine_Name=${searchTerm}`,
        {
          headers: headers,
        }
      )
        .then((response) => response.text())
        .then((textResponse) => {
          console.log(textResponse);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  }

  console.log(searchAPI())

  //Load custom fonts
  const [loaded] = useFonts({
    MADTypeVariableBlack: require("./assets/fonts/MADTypeVariableBlack.otf"),
    NahdiBlack: require("./assets/fonts/NahdiBlack.ttf"),
  });

  const [data, setData] = useState([
    {
      id: "1",
      text: "lorem ipsum",
      height: 100,
    },
    {
      id: "2",
      text: "lorem ipsum dorem lorem ipsum lorem ipsum",
      height: 200,
    },
    {
      id: "3",
      text: "lorem ipsum lorem ipsum",
      height: 200,
    },
  ]);
  const [images, setImages] = useState([
    require("./assets/images/featured1.gif"), // Local image
    require("./assets/images/featured2.gif"),
    require("./assets/images/featured3.gif"),
    require("./assets/images/featured4.jpg"),
    require("./assets/images/featured5.gif"),
    require("./assets/images/featured6.jpg"),
    require("./assets/images/featured7.jpg"),
  ]);
  const [keywords, setKeyWords] = useState("");

  keyExtractor = (item) => item.id;

  renderItem = ({ item }) => (
    <Card
      image={require("./assets/images/beach.png")}
      imageStyle={{ height: 50 }}
      containerStyle={[styles.card, { height: 200 }]}
    >
      <Text style={{ margin: 10 }}>{item.text}</Text>
    </Card>
  );

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ backgroundColor: "#fff" }}>
      <SearchBar
        placeholder="What are you looking for?"
        onChangeText={(value) => setKeyWords(value)}
        onSubmitEditing={() => console.log(`User typed: ${keywords}`)}
        value={keywords}
        inputContainerStyle={styles.searchcontainer}
        containerStyle={styles.searchcontainer}
        inputStyle={styles.searchinput}
        lightTheme
        searchIcon={<Icon name="search" type="font-awesome" />}
      />
      <SliderBox
        images={images}
        resizeMethod={"resize"}
        resizeMode={"cover"}
        dotColor="#278585"
        inactiveDotColor="#90A4AE"
        imageLoadingColor="#278585"
        ImageComponentStyle={{
          backgroundColor: "#fff",
        }}
        autoplay
        circleLoop
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

// Profile screen
const ProfileScreen = ({ navigation, route }) => {
  return <Text>janes' profile</Text>;
};

const Stack = createStackNavigator();

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
            headerTintColor: "#278585",
            headerRight: () => (
              <Icon
                name="shopping-cart"
                type="font-awesome"
                color="#278585"
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
            headerTintColor: "#278585",
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
  list: {
    justifyContent: "space-around",
    paddingBottom: 300,
  },
  column: {
    flexShrink: 1,
  },
  card: {
    width: (Dimensions.get("window").width - 4 * 10) / 2,
    margin: 10,
  },
  text: {
    fontFamily: "MADTypeVariableBlack",
    fontSize: 18,
    color: "#fff",
  },
  iconcontainer: {
    paddingRight: 15,
  },
  searchcontainer: {
    backgroundColor: "#fff",
  },
  searchinput: {
    color: "#278585",
  },
});
