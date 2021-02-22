import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { Icon, SearchBar, Card } from "react-native-elements";
import { useFonts } from "expo-font";
import { SliderBox } from "react-native-image-slider-box";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BottomToolbar from "react-native-bottom-toolbar";

import ProductCard from "./ProductCard";
import withBadge from "./withBadge";

// Home screen
const HomeScreen = ({ navigation }) => {
  //Load custom fonts
  const [loaded] = useFonts({
    MADTypeVariableBlack: require("./assets/fonts/MADTypeVariableBlack.otf"),
    NahdiBlack: require("./assets/fonts/NahdiBlack.ttf"),
  });

  const [data, setData] = useState([]);

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

  keyExtractor = (item) => item.sku;

  const testNavigation = (index) => {
    navigation.navigate("PDP", { product: data[index] });
  };

  renderItem = ({ item }) => {
    return <ProductCard item={item} testNavigation={testNavigation} />;
  };

  //FETCHING DATA LOGIC
  async function searchAPI(keyWords) {
    try {
      const searchTerm = keyWords;
      const username = "alturkey.ya";
      const password = "Ya@123456";

      const base64 = require("base-64");

      const headers = new Headers();
      headers.append(
        "Authorization",
        "Basic " + base64.encode(`${username}:${password}`)
      );

      console.log("Keywords to search for in Nahdi's API: " + searchTerm);
      const extractedSKUs = await fetch(
        `https://int.nahdi.sa/soa-infra/resources/default/ChatbotProductSearch!1.0/Search?Medicine_Name=${searchTerm}`,
        {
          headers: headers,
        }
      )
        .then((response) => response.text())
        .then((textResponse) => {
          //Extract only the SKUs
          return textResponse.match(
            /[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]/g
          );
        })
        .catch((error) => {
          console.log(error);
        });

      console.log("SKUS");
      console.log(extractedSKUs);

      let productList = [];
      let index = 0;
      for (
        var i = 0;
        i < (extractedSKUs.length > 20 ? 20 : extractedSKUs.length);
        i++
      ) {
        let productResponse = await fetch(
          `https://www.nahdionline.com/en/rest/V1/products/${extractedSKUs[i]}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + "kmdw6ud7as4l3vo6zmoxx2lf42po5fn1",
            },
          }
        ).catch((error) => {
          console.log(error);
        });

        if (!productResponse.ok) {
          //Need to generate a new token. This need improvement for all cases!
          console.log("Product fetch returned: ", productResponse.ok);
          console.log(
            "The product that was requested doesn't exist or the auth token has expired."
          );
          continue;
        } else {
          productResponse = await productResponse.json();
        }

        let customAttributes = {
          description: "",
          image: "",
          url_key: "",
          gift_message_available: "",
          short_description: "",
          meta_title: "",
          gift_wrapping_available: "",
          manufacturer: "",
          msrp: "",
          store_pickup_available: "",
          upc: "",
          is_returnable: "",
          dc_only: "",
          safety_stock_level: "",
          alternative_product: "",
          quantity: "",
        };

        productResponse.custom_attributes.filter(function (item) {
          if (item.attribute_code === "description")
            customAttributes.description = item.value;

          if (item.attribute_code === "image")
            customAttributes.image = item.value;

          if (item.attribute_code === "url_key")
            customAttributes.url_key = item.value;

          if (item.attribute_code === "gift_message_available")
            customAttributes.gift_message_available = item.value;

          if (item.attribute_code === "short_description")
            customAttributes.short_description = item.value;

          if (item.attribute_code === "meta_title")
            customAttributes.meta_title = item.value;

          if (item.attribute_code === "gift_wrapping_available")
            customAttributes.gift_wrapping_available = item.value;

          if (item.attribute_code === "manufacturer")
            customAttributes.manufacturer = item.value;

          if (item.attribute_code === "msrp")
            customAttributes.msrp = item.value;

          if (item.attribute_code === "store_pickup_available")
            customAttributes.store_pickup_available = item.value;

          if (item.attribute_code === "upc") customAttributes.upc = item.value;

          if (item.attribute_code === "is_returnable")
            customAttributes.is_returnable = item.value;

          if (item.attribute_code === "dc_only")
            customAttributes.dc_only = item.value;

          if (item.attribute_code === "safety_stock_level")
            customAttributes.safety_stock_level = item.value;

          if (item.attribute_code === "alternative_product")
            customAttributes.alternative_product = item.value;

          if (item.attribute_code === "quantity")
            customAttributes.quantity = item.value;
          return;
        });

        productList.push({
          name: productResponse.name,
          description: customAttributes.description,
          short_description: customAttributes.short_description,
          price: productResponse.price,
          status: productResponse.status === 1 ? "Available" : "Not available",
          updated_at: productResponse.updated_at,
          image: `https://nahdionline.com/media/catalog/product${customAttributes.image}`,
          url_key: `https://www.nahdionline.com/en/${customAttributes.url_key}`,
          gift_message_available: customAttributes.gift_message_available,
          gift_wrapping_available: customAttributes.gift_wrapping_available,
          manufacturer: customAttributes.manufacturer,
          store_pickup_available:
            customAttributes.store_pickup_available === "1"
              ? "Available for Store Pickup"
              : "Not available for Store Pickup",
          returnable: customAttributes.is_returnable,
          dc_only: customAttributes.dc_only,
          alternative_product: customAttributes.alternative_product,
          quantity: customAttributes.quantity,
          sku: productResponse.sku,
          index: index++,
        });
      }

      setData(productList);
    } catch (err) {
      console.log(err);
    }
  }

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ backgroundColor: "#fff" }}>
      <SearchBar
        placeholder="What are you looking for?"
        onChangeText={(value) => setKeyWords(value)}
        onSubmitEditing={() => {
          setData([]);
          searchAPI(keywords);
        }}
        value={keywords}
        inputContainerStyle={styles.searchcontainer}
        containerStyle={styles.searchcontainer}
        inputStyle={styles.searchinput}
        lightTheme
        searchIcon={<Icon name="search" type="font-awesome" color="#90A4AE" />}
      />
      <TouchableHighlight
        style={{ backgroundColor: "#C60411" }}
        underlayColor="#90A4AE"
        activeOpacity={0.6}
        onPress={() => console.log("pressed on tos")}
      >
        <Text
          style={{
            fontSize: 10,
            color: "#fff",
            textAlign: "center",
            padding: 10,
            fontWeight: "bold",
            textDecorationLine: "underline",
          }}
        >
          Use "Nahdi25" for an extra discount 25 SR off when you buy with 250.
          T&C apply.
        </Text>
      </TouchableHighlight>
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
        extraData={data}
      />
    </View>
  );
};

// PDP screen
const PDPScreen = ({ navigation, route }) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ScrollView
        style={{ marginHorizontal: 20 }}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity>
          <Image
            source={{
              uri:
                route.params.product.image ===
                "https://nahdionline.com/media/catalog/product"
                  ? "https://media.glassdoor.com/sqll/930146/nahdi-medical-company-squarelogo-1542203153238.png"
                  : route.params.product.image,
            }}
            resizeMode={"contain"}
            style={{ width: 400, height: 400 }}
          />
        </TouchableOpacity>
        <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ width: 50, height: 50 }}>
            <Icon
                reverse
                name="truck"
                type="font-awesome"
                color="#278585"
                size={20}
                // onPress={() => setQuantity(quantity + 1)}
              />
            </View>
            <View style={{ width: 50, height: 50 }}>
            <Icon
                reverse
                name="shopping-basket"
                type="font-awesome"
                color="#278585"
                size={20}
                // onPress={() => setQuantity(quantity + 1)}
              />
            </View>
            <View style={{ width: 50, height: 50 }}>
            <Icon
                reverse
                name="thumbs-up"
                type="font-awesome"
                color="#278585"
                size={20}
                // onPress={() => setQuantity(quantity + 1)}
              />
            </View>
          </View>
        <View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              textAlign: "center",
              fontFamily: "MADTypeVariableBlack",
              fontSize: 20,
              fontWeight: "bold",
              color: "#278585",
              paddingVertical: 20,
            }}
          >
            {route.params.product.short_description}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "#278585",
            }}
          >
            {route.params.product.price} SAR
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ width: 50, height: 50, marginTop: 20 }}>
              <Icon
                name="minus"
                type="font-awesome"
                color="#278585"
                size={20}
                // onPress={() => setQuantity(quantity - 1)}
              />
            </View>
            <View style={{ width: 50, height: 50 }}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  color: "#278585",
                  fontWeight: "bold",
                  borderColor: "#278585",
                  borderWidth: 1,
                }}
              >
                1
              </Text>
            </View>
            <View style={{ width: 50, height: 50, marginTop: 20 }}>
              <Icon
                name="plus"
                type="font-awesome"
                color="#278585"
                size={20}
                // onPress={() => setQuantity(quantity + 1)}
              />
            </View>
          </View>
          <Text>{route.params.product.description}</Text>
        </View>
      </ScrollView>
      <BottomToolbar wrapperStyle={{backgroundColor: "#278585", width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        <BottomToolbar.Action
        title='Add to Cart'
          IconElement={
            <TouchableHighlight
            style={{width: 500}}
            underlayColor="#90A4AE"
            activeOpacity={0.6}
          >
            <View style={{ padding: 5 }}>
              <Icon
                name="shopping-cart"
                type="font-awesome"
                color="#fff"
                size={30}
                onPress={() => console.log('clicked ')}
              />
            </View>
          </TouchableHighlight>
          }
        />
      </BottomToolbar>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    MADTypeVariableBlack: require("./assets/fonts/MADTypeVariableBlack.otf"),
    NahdiBlack: require("./assets/fonts/NahdiBlack.ttf"),
  });

  let BadgedIcon = withBadge(1)(Icon);

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
            headerStyle: {
              backgroundColor: "#278585",
            },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity>
                <BadgedIcon
                  name="shopping-cart"
                  type="font-awesome"
                  color="#fff"
                  size={28}
                  style={{ paddingRight: 15, paddingBottom: 3 }}
                />
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <TouchableOpacity>
                <Image
                  style={{ width: 35, height: 35, marginLeft: 15 }}
                  source={require("./assets/images/icon.png")}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="PDP"
          component={PDPScreen}
          options={({ route }) => ({
            title: route.params.product.name,
            headerTintColor: "#278585",
            headerTitleStyle: {
              fontFamily: "MADTypeVariableBlack",
            },
            headerStyle: {
              backgroundColor: "#278585",
            },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity>
                <BadgedIcon
                  name="shopping-cart"
                  type="font-awesome"
                  color="#fff"
                  size={28}
                  style={{ paddingRight: 15, paddingBottom: 3 }}
                />
              </TouchableOpacity>
            ),
          })}
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
    paddingBottom: 350,
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
