import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions,
} from "react-native";

import { Icon, Card } from "react-native-elements";
import "react-native-gesture-handler";

class ProductCard extends Component {
  constructor() {
    super();
    this.state = {
      quantity: 1,
    };
  }

  incrementQuantity() {
    this.setState({
      quantity: this.state.quantity + 1,
    });
  }

  decrementQuantity() {
    this.setState({
      quantity: this.state.quantity - 1,
    });
  }

  resetQuantity() {
    this.setState({
      quantity: 1,
    });
  }

  render() {
    const item = this.props.item;
    const navigationHandler = this.props.navigationHandler;

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => navigationHandler(item.index)}
      >
        <Card containerStyle={styles.card}>
          <Card.Title
            style={{
              color: "#278585",
              fontSize: 12,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            {item.status}
          </Card.Title>
          <Card.Divider />
          <Card.Image
            source={{
              uri:
                item.image === "https://nahdionline.com/media/catalog/product"
                  ? "https://media.glassdoor.com/sqll/930146/nahdi-medical-company-squarelogo-1542203153238.png"
                  : item.image,
            }}
            resizeMode={"contain"}
          />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "MADTypeVariableBlack",
              color: "#90A4AE",
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text
            style={{
              textAlign: "center",
              paddingTop: 15,
              color: "#278585",
              fontSize: 16,
              fontFamily: "MADTypeVariableBlack",
            }}
          >
            {item.price === undefined ? "0" : item.price} SAR
          </Text>
          <View style={{ flex: 1, flexDirection: "row", marginTop: 20 }}>
            <View style={{ width: 50, height: 50, marginTop: 10 }}>
              <Icon
                name="minus"
                type="font-awesome"
                color="#278585"
                size={20}
                onPress={this.decrementQuantity.bind(this)}
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
                  fontFamily: "MADTypeVariableBlack",
                }}
              >
                {this.state.quantity}
              </Text>
            </View>
            <View style={{ width: 50, height: 50, marginTop: 10 }}>
              <Icon
                name="plus"
                type="font-awesome"
                color="#278585"
                size={20}
                onPress={this.incrementQuantity.bind(this)}
              />
            </View>
          </View>
          <TouchableHighlight
            underlayColor="#90A4AE"
            activeOpacity={0.6}
            onPress={() => {
              item["orderQuantity"] = this.state.quantity;
              this.props.cart.count =
              this.props.cart.count + this.state.quantity;
              this.props.cartList.push(item);
              this.setState({ quantity: 1 });
            }}
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
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    width: (Dimensions.get("window").width - 4 * 10) / 2,
    margin: 10,
  },
});

export default ProductCard;
