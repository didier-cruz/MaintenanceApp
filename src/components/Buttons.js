import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native";
import Colors from "../constants/Colors";
import Dimensions from "../constants/Dimensions";

/**
 * Button used to Confirm Screens
 * @param {string} buttonText - Text to be rendered in a button
 * @param {function} onPress - Event handler
 * @returns ConfirmButton
 */
export const ConfirmButton = ({ buttonText, onPress }) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={buttonText}
      android_ripple={{ color: Colors.accent }}
      style={({ pressed }) => [
        styles.confirmButton,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.confirmButtonText}>{buttonText}</Text>
    </Pressable>
  );
};

/**
 * Button used to cancel the Dialog Screen
 * @param {function} onPress - Event handler
 * @returns CancelButton
 */
export const CancelButton = ({ onPress }) => {
  return (
    <View style={styles.cancelButtonContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        style={styles.cancelButton}
        onPress={onPress}
      >
        <View
          style={{
            ...styles.cancelButtonline,
            transform: [{ rotate: "45deg" }],
          }}
        >
          <View
            style={{
              ...styles.cancelButtonline,
              transform: [{ rotate: "90deg" }],
            }}
          ></View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Exit Button to take the user away of a plantel
 * @param {string} text - Text to be shown as a label button
 * @param {function} onPress - Event handler
 * @returns ExitButton
 */
export const ExitButton = ({ text, onPress }) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      style={({ pressed }) => [styles.exitButton, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.exitButtonText}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  confirmButton: {
    width: "100%",
    height: 75,
    borderRadius: 100,
    backgroundColor: Colors.complementary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  exitButton: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.complementary,
    borderColor: Colors.accent,
    borderRadius: 100,
    borderWidth: 3,
  },
  exitButtonText: {
    color: Colors.accent,
    fontSize: 18,
    textAlign: "center",
  },
  confirmButtonText: {
    color: Colors.accent,
    fontSize: 25,
  },
  cancelButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.complementary,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonline: {
    width: 25,
    height: 7,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  cancelButtonContainer: {
    width: Dimensions.width * 0.8,
    alignItems: "flex-end",
  },
});
