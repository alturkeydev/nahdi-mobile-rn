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
} from "react-native";

import { Icon, SearchBar, Card } from "react-native-elements";
import { useFonts } from "expo-font";
import { SliderBox } from "react-native-image-slider-box";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

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

  renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <Card.Title style={{ color: "#278585", fontSize: 12 }}>
        {item.status}
      </Card.Title>
      <Card.Divider />
      <Card.Image source={{ uri: item.image === 'https://nahdionline.com/media/catalog/product' ? 'https://media.glassdoor.com/sqll/930146/nahdi-medical-company-squarelogo-1542203153238.png' : item.image }} resizeMode={'contain'} />
      <Text style={{fontSize: 16}} numberOfLines={2} ellipsizeMode='tail'>{item.name}</Text>
      <Text
        style={{
          textAlign: "center",
          paddingTop: 15,
          color: "#278585",
          fontSize: 16,
        }}
      >
        {item.price === undefined ? '0' : item.price} SAR
      </Text>
      <View style={{ flex: 1, flexDirection: "row", marginTop: 20 }}>
        <View style={{ width: 50, height: 50, marginTop: 10 }}>
          <Icon name="minus" type="font-awesome" color="#278585" size={20} />
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
        <View style={{ width: 50, height: 50, marginTop: 10 }}>
          <Icon name="plus" type="font-awesome" color="#278585" size={20} />
        </View>
      </View>
      <TouchableHighlight
        underlayColor="#90A4AE"
        activeOpacity={0.6}
        onPress={() => { }}
        style={{ backgroundColor: "#278585" }}
      >
        <View style={{ padding: 5 }}>
          <Icon
            name="shopping-cart"
            type="font-awesome"
            color="#fff"
            size={25}
          />
        </View>
      </TouchableHighlight>
    </Card>
  );

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
      for (var i = 0; i < (extractedSKUs.length > 20 ? 20 : extractedSKUs.length); i++) {
        let productResponse = await fetch(
          `https://www.nahdionline.com/en/rest/V1/products/${extractedSKUs[i]}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + "z67qj8blz8eez6medzbfg0o34alxv7qc",
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

          if (item.attribute_code === "msrp") customAttributes.msrp = item.value;

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

        // console.log("\n\nPRODUCTS INFO\n\n");
        // console.log("Name: ", productResponse.name);
        // console.log("Desc: ", customAttributes.description);
        // console.log("Short desc: ", customAttributes.short_description);
        // console.log("Price: ", productResponse.price);
        // console.log(
        //   "Status: ",
        //   productResponse.status === 1 ? "Available" : "Not available"
        // );
        // console.log("Updated: ", productResponse.updated_at);
        // console.log(
        //   "Image url: ",
        //   `https://nahdionline.com/media/catalog/product${customAttributes.image}`
        // );
        // console.log(
        //   "Url key: ",
        //   `https://www.nahdionline.com/en/${customAttributes.url_key}`
        // );
        // console.log(
        //   "Gift message: ",
        //   customAttributes.gift_message_available === "0"
        //     ? "There is no gift message for this product."
        //     : customAttributes.gift_message_available
        // );
        // console.log(
        //   "Gift wrapping: ",
        //   customAttributes.gift_wrapping_available === "0"
        //     ? "There is no gift wrapping for this product."
        //     : customAttributes.gift_wrapping_available
        // );
        // console.log("Manufacturer: ", customAttributes.manufacturer);
        // console.log(
        //   "Store pickup: ",
        //   customAttributes.store_pickup_available === "1"
        //     ? "Available for Store Pickup"
        //     : "Not available for Store Pickup"
        // );
        // console.log(
        //   "Returnable: ",
        //   customAttributes.is_returnable === "2"
        //     ? "This product is not returnable."
        //     : "This product is returnable."
        // );
        // console.log(
        //   "DC only: ",
        //   customAttributes.dc_only === "0"
        //     ? "This product is DC only."
        //     : "This product is not DC only."
        // );
        // console.log(
        //   "Alternative products: ",
        //   customAttributes.alternative_product
        // );
        // console.log("Quantity: ", customAttributes.quantity);
        // console.log("SKU: ", productResponse.sku);

        // data.push(
        //   {
        //   name: productResponse.name,
        //   description: customAttributes.description,
        //   short_description: customAttributes.short_description,
        //   price: productResponse.price,
        //   status: productResponse.status === 1 ? "Available" : "Not available",
        //   updated_at: productResponse.updated_at,
        //   image: `https://nahdionline.com/media/catalog/product${customAttributes.image}`,
        //   url_key: `https://www.nahdionline.com/en/${customAttributes.url_key}`,
        //   gift_message_available: customAttributes.gift_message_available,
        //   gift_wrapping_available: customAttributes.gift_wrapping_available,
        //   manufacturer: customAttributes.manufacturer,
        //   store_pickup_available:
        //     customAttributes.store_pickup_available === "1"
        //       ? "Available for Store Pickup"
        //       : "Not available for Store Pickup",
        //   returnable: customAttributes.is_returnable,
        //   dc_only: customAttributes.dc_only,
        //   alternative_product: customAttributes.alternative_product,
        //   quantity: customAttributes.quantity,
        //   sku: productResponse.sku,
        // });

        productList.push(
          {
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
          }
        );
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
    <View style={{ backgroundColor: '#fff' }}>
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
          }}
        >
          استخدم كود Nahdi25 واستمتع بخصم إضافي 25 ريال عند التسوق ب 250. تطبق
          الشروط والأحكام
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
            headerStyle: {
              backgroundColor: "#278585",
            },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity>
                <Image
                  style={{ width: 30, height: 30, marginRight: 15 }}
                  source={require("./assets/images/shopping-basket.png")}
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
