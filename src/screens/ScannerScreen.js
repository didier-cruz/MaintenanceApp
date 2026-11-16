import { SafeAreaView } from "react-native-safe-area-context";
import { STACK_SCREEN_EDGES } from "../constants/SafeArea";
import React from "react";

import { View, Text, StyleSheet } from "react-native";
import Dimensions from "../constants/Dimensions";
import Colors from "../constants/Colors";

export default () => {
  return (
    <SafeAreaView edges={STACK_SCREEN_EDGES} style={styles.container}>
      <View>
        <Text>Pantalla Escaner</Text>
      </View>
    </SafeAreaView>
  );
};

const { MainWidthContainer, MainHeightContainer } = Dimensions;
const { complementary, inactive, dominant, accent } = Colors;
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: complementary,
    opacity: 0.5,
  },
});
