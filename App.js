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
  LogBox,
} from "react-native";

import { Icon, SearchBar, Overlay, Card } from "react-native-elements";
import { useFonts } from "expo-font";
import { SliderBox } from "react-native-image-slider-box";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  HeaderBackButton,
} from "@react-navigation/stack";
import Toast, { BaseToast } from "react-native-toast-message";
import { WebView } from "react-native-webview";
import { Rating } from "react-native-ratings";

import ProductCard from "./ProductCard";
import withBadge from "./withBadge";
import { TextInput } from "react-native-gesture-handler";

LogBox.ignoreLogs(["Setting a timer"]);

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

  //Nahdi Auth Token
  const [authToken, setAuthToken] = useState(
    "3ardmf5hehij87kaea966hguohjpe6r0"
  );

  keyExtractor = (item) => item.sku;

  const testNavigation = (index) => {
    navigation.navigate("PDP", { product: data[index] });
  };

  renderItem = ({ item }) => {
    return <ProductCard item={item} testNavigation={testNavigation} />;
  };

  //FETCHING DATA LOGIC
  async function searchAPI(keyWords) {
    let timedOut = false;

    setTimeout(() => {
      timedOut = true;
    }, 35000);

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
      let extractedSKUs = await fetch(
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

      console.log("Limiting SKUs to 20...");
      extractedSKUs = extractedSKUs.slice(0, 10);
      console.log("SKUs");
      console.log(extractedSKUs);

      let productList = [];
      let relatedProductsData;
      let index = 0;
      for (var i = 0; i < extractedSKUs.length; i++) {
        relatedProductsData = [];

        if (timedOut) {
          Toast.show({
            text1: "Data Fetch Took More Than 30s",
            text2: "I timed out the request to preserve your UX 😔.",
            // type: 'info',
            position: "bottom",
            bottomOffset: 60,
          });

          //Exit function
          return;
        }
        let productResponse = await fetch(
          `https://www.nahdionline.com/en/rest/V1/products/${extractedSKUs[i]}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: "Bearer " + authToken,
            },
          }
        ).catch((error) => {
          console.log(error);
        });

        if (!productResponse.ok) {
          //Need to generate a new token. This need improvement for all cases!
          console.log(
            `The product with SKU: ${extractedSKUs[i]} doesn't exist or the auth token has expired.`
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
          relatedProducts: [],
          quantity: "",
        };

        productResponse.custom_attributes.filter(function (item) {
          if (item.attribute_code === "meta_description")
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

        let arAlternativeProducts = customAttributes.alternative_product.split(
          ","
        );

        //Limiting related products to only two
        if (arAlternativeProducts.length > 2)
          arAlternativeProducts = arAlternativeProducts.slice(0, 2);

        console.log(arAlternativeProducts);

        for (let i = 0; i < arAlternativeProducts.length; i++) {
          if (timedOut) return;

          let relatedProductResponse = await fetch(
            `https://www.nahdionline.com/en/rest/V1/products/${arAlternativeProducts[i]}`,
            {
              headers: {
                Accept: "application/json",
                Authorization: "Bearer " + authToken,
              },
            }
          ).catch((error) => {
            console.log(error);
          });

          if (!relatedProductResponse.ok) {
            //Need to generate a new token. This needs improvement for all cases!
            console.log(
              `The product with SKU: ${extractedSKUs[i]} doesn't exist or the auth token has expired.`
            );
            continue;
          } else {
            relatedProductResponse = await relatedProductResponse.json();
          }

          let relatedCustomAttributes = {
            name: "",
            image: "",
            url_key: "",
            short_description: "",
            meta_title: "",
            price: "",
            sku: "",
          };

          relatedProductResponse.custom_attributes.filter(function (item) {
            if (item.attribute_code === "image")
              relatedCustomAttributes.image = item.value;

            if (item.attribute_code === "url_key")
              relatedCustomAttributes.url_key = item.value;

            if (item.attribute_code === "short_description")
              relatedCustomAttributes.short_description = item.value;

            if (item.attribute_code === "meta_title")
              relatedCustomAttributes.meta_title = item.value;

            return;
          });

          relatedProductsData.push({
            name: relatedProductResponse.name,
            image: `https://nahdionline.com/media/catalog/product${relatedCustomAttributes.image}`,
            url_key: `https://www.nahdionline.com/en/${relatedCustomAttributes.url_key}`,
            short_description: relatedCustomAttributes.short_description,
            meta_title: relatedCustomAttributes.meta_title,
            price: relatedProductResponse.price,
            sku: relatedProductResponse.sku,
          });
        }

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
          relatedProducts: relatedProductsData,
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
            fontFamily: "MADTypeVariableBlack",
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
  const [visible, setVisible] = useState(false);

  const toggleOverlay = () => {
    setVisible(!visible);
  };

  if (visible) {
    return (
      <View>
        <Overlay fullScreen isVisible={visible} onBackdropPress={toggleOverlay}>
          <WebView source={{ uri: route.params.product.url_key }} />
        </Overlay>
      </View>
    );
  }

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
            style={{ width: 256, height: 256 }}
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
              size={16}
              onPress={() => {
                Toast.show({
                  text1: "Same Day Delivery",
                  text2: "Order now and get it today 👌.",
                  // type: 'info',
                  position: "bottom",
                  bottomOffset: 60,
                });
              }}
            />
          </View>
          <View style={{ width: 50, height: 50 }}>
            <Icon
              reverse
              name="shopping-bag"
              type="font-awesome"
              color="#278585"
              size={16}
              onPress={() => {
                Toast.show({
                  text1: "Available for Store Pickup",
                  text2: "Order now and pickup from any store anytime 👍.",
                  // type: 'info',
                  position: "bottom",
                  bottomOffset: 60,
                });
              }}
            />
          </View>
          <View style={{ width: 50, height: 50 }}>
            <Icon
              reverse
              name="check-square"
              type="font-awesome"
              color="#278585"
              size={16}
              onPress={() => {
                Toast.show({
                  text1: "Stock Availability",
                  text2: `There are ${route.params.product.quantity} units of this product in-stock.`,
                  position: "bottom",
                  bottomOffset: 60,
                });
              }}
            />
          </View>
          <View style={{ width: 50, height: 50 }}>
            <Icon
              reverse
              name="gift"
              type="font-awesome"
              color="#278585"
              size={16}
              onPress={() => {
                Toast.show({
                  text1: "Nudeek Rewards",
                  text2: "Order now and receive 258 Nuhdeek points 🤩.",
                  position: "bottom",
                  bottomOffset: 60,
                });
              }}
            />
          </View>
          <View style={{ width: 50, height: 50, marginHorizontal: 7 }}>
            <TouchableOpacity onPress={toggleOverlay}>
              <Image
                source={require("./assets/images/icon.png")}
                style={{ width: 30, height: 30, marginTop: 10 }}
                resizeMode={"contain"}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              textAlign: "center",
              color: "#278585",
              fontSize: 18,
              fontFamily: "MADTypeVariableBlack",
              paddingVertical: 15,
            }}
          >
            {route.params.product.name}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              color: "#90A4AE",
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            {route.params.product.price} SAR
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#278585",
              fontSize: 20,
              fontFamily: "MADTypeVariableBlack",
              paddingVertical: 15,
            }}
          >
            {"Product Description"}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
              lineHeight: 20,
            }}
          >
            {route.params.product.description
              .replace(/<[^>]*>/g, "")
              .replace(/[^a-zA-Z ]/g, "")}
            .
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#278585",
              fontSize: 20,
              fontFamily: "MADTypeVariableBlack",
              paddingVertical: 15,
            }}
          >
            Product Info
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            This product is{" "}
            {route.params.product.returnable === "2"
              ? "not returnable"
              : "returnable"}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            Updated on {route.params.product.updated_at}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            Manufacturer id {route.params.product.manufacturer}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            Supplied by{" "}
            {route.params.product.dc_only === "0"
              ? "Distribution Center only"
              : "Distribution Center and others"}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#90A4AE",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            SKU {route.params.product.sku}
          </Text>
          <Text
            style={{
              textAlign: "justify",
              color: "#278585",
              fontSize: 20,
              fontFamily: "MADTypeVariableBlack",
              paddingTop: 15,
            }}
          >
            Rating
          </Text>
          <View>
            <Rating
              type="custom"
              ratingColor="#278585"
              ratingBackgroundColor="#fff"
              ratingCount={5}
              imageSize={40}
              showRating
              onFinishRating={() => {
                Toast.show({
                  text1: "Pseudo Rating Received",
                  text2: "Thank you for rating this product 😘.",
                  position: "bottom",
                  bottomOffset: 60,
                });
              }}
            />
          </View>
          <Text
            style={{
              textAlign: "justify",
              color: "#278585",
              fontSize: 20,
              fontFamily: "MADTypeVariableBlack",
              paddingVertical: 5,
            }}
          >
            Review
          </Text>
          <TouchableOpacity
            onPress={() => {
              Toast.show({
                text1: "Review Not Available",
                text2: "Sorry, PoC doesn't support reviewing products.",
                position: "bottom",
                bottomOffset: 60,
              });
            }}
          >
            <TextInput
              editable={false}
              placeholder={"Write a review..."}
              style={{
                borderWidth: 1,
                borderColor: "#278585",
                lineHeight: 40,
                padding: 20,
                width: "95%",
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "justify",
              color: "#278585",
              fontSize: 20,
              fontFamily: "MADTypeVariableBlack",
              paddingTop: 15,
            }}
          >
            Related Products
          </Text>
          <View>
            <View>
              <Text>{console.log(route.params.product.relatedProducts)}</Text>
              {
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity style={{ width: 180 }}>
                    <Card>
                      <Card.Title
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: "#278585",
                          fontSize: 10,
                          fontFamily: "MADTypeVariableBlack",
                        }}
                      >
                        {route.params.product.relatedProducts[0].name}
                      </Card.Title>
                      <Card.Divider />
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              route.params.product.relatedProducts[0].image ===
                              "https://nahdionline.com/media/catalog/product"
                                ? "https://media.glassdoor.com/sqll/930146/nahdi-medical-company-squarelogo-1542203153238.png"
                                : route.params.product.relatedProducts[0].image,
                          }}
                          style={{ width: 92, height: 92 }}
                          resizeMode={"contain"}
                        />
                      </View>
                    </Card>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 180 }}>
                    <Card>
                      <Card.Title
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: "#278585",
                          fontSize: 10,
                          fontFamily: "MADTypeVariableBlack",
                        }}
                      >
                        {route.params.product.relatedProducts[0].name}
                      </Card.Title>
                      <Card.Divider />
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          source={{
                            uri:
                              route.params.product.relatedProducts[0].image ===
                              "https://nahdionline.com/media/catalog/product"
                                ? "https://media.glassdoor.com/sqll/930146/nahdi-medical-company-squarelogo-1542203153238.png"
                                : route.params.product.relatedProducts[0].image,
                          }}
                          style={{ width: 92, height: 92 }}
                          resizeMode={"contain"}
                        />
                      </View>
                    </Card>
                  </TouchableOpacity>
                </View>
              }
            </View>
          </View>
        </View>
        <View style={{ paddingBottom: 50 }} />
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: 50,
          paddingTop: 25,
          width: "100%",
          backgroundColor: "#fff",
        }}
      >
        <View style={{ width: 50, height: 50, marginTop: 12 }}>
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
              fontSize: 18,
              color: "#278585",
              fontWeight: "bold",
              borderColor: "#90A4AE",
              borderWidth: 1,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            1
          </Text>
        </View>
        <View style={{ width: 50, height: 50, marginTop: 12 }}>
          <Icon
            name="plus"
            type="font-awesome"
            color="#278585"
            size={20}
            // onPress={() => setQuantity(quantity + 1)}
          />
        </View>
      </View>
      <TouchableHighlight
        style={{ width: "100%", backgroundColor: "#278585" }}
        underlayColor="#90A4AE"
        activeOpacity={0.6}
      >
        <View style={{ padding: 5 }}>
          <Icon
            name="cart-plus"
            type="font-awesome"
            color="#fff"
            size={30}
            onPress={() => console.log("clicked ")}
          />
        </View>
      </TouchableHighlight>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <BaseToast
      {...rest}
      style={{ borderLeftColor: "#278585", fontFamily: "MADTypeVariableBlack" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        color: "#278585",
      }}
      text1={text1}
      text2={text2}
      leadingIcon={require("./assets/images/icon.png")}
    />
  ),
};

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
                  name="shopping-basket"
                  type="font-awesome"
                  color="#fff"
                  size={25}
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
                  name="shopping-basket"
                  type="font-awesome"
                  color="#fff"
                  size={25}
                  style={{ paddingRight: 15, paddingBottom: 3 }}
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
      <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
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
