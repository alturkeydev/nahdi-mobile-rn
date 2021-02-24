import React from "react";
import { StyleSheet, View } from "react-native";
import { Badge } from "react-native-elements";

let withBadge = (value, options = {}) => (WrappedComponent) =>
  class extends React.Component {
    render() {
      let {
        top = -10,
        right = -10,
        left = 0,
        bottom = 0,
        hidden = !value,
        ...badgeProps
      } = options;
      let badgeValue =
        typeof value === "function" ? value(this.props) : value;
      return (
        <View>
          <WrappedComponent {...this.props} />
          {!hidden && (
            <Badge
              badgeStyle={styles.badge}
              textStyle={styles.badgeText}
              value={badgeValue}
              status="error"
              containerStyle={[
                styles.badgeContainer,
                { top, right, left, bottom },
              ]}
              {...badgeProps}
            />
          )}
        </View>
      );
    }
  };

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9,
    height: 18,
    minWidth: 0,
    width: 18,
    backgroundColor: '#ff6900'
  },
  badgeContainer: {
    position: "absolute",
  },
  badgeText: {
    fontSize: 10,
    paddingHorizontal: 0,
  },
});

export default withBadge;
