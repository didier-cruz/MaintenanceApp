import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import Dimensions from "../constants/Dimensions";
import Colors from "../constants/Colors";

/**
 *Group of buttons that show the type of different options, you can choose only one
 * @param {Array} buttons - Holds the tests to be shown as text buttons
 * @param {function} updateIndex - Method that changes the index state
 * @param {number} selectedIndex - The index State chosen when button is pressed
 * @returns ButtonGrupType - a component with the buttons provided
 */
export const ButtonGroupType = ({ buttons, updateIndex, selectedIndex }) => {
  return (
    <View style={styles.fragmentContainer} accessibilityRole="tablist">
      {buttons.map((title, index) => {
        const selected = index === selectedIndex;
        return (
          <Pressable
            key={title}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => updateIndex(index)}
            style={[
              styles.fragmentButtonContainer,
              selected && styles.fragmentSelectedButton,
            ]}
          >
            <Text
              style={[
                styles.textButtonStyle,
                selected && styles.fragmentTextSelectedStyle,
              ]}
            >
              {title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const HeightTitleContainer = Dimensions.height * 0.07;
const styles = StyleSheet.create({
  textButtonStyle: {
    color: Colors.complementary,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  fragmentContainer: {
    flexDirection: "row",
    height: HeightTitleContainer,
    marginVertical: 10,
  },
  fragmentButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.complementary,
  },
  fragmentSelectedButton: {
    backgroundColor: Colors.complementary,
  },
  fragmentTextSelectedStyle: { fontWeight: "bold", color: Colors.accent },
});
