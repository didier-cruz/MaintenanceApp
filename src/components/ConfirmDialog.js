import React, { useState } from "react";
import { View, StyleSheet, Text, Modal, Pressable } from "react-native";
//components
import { Title } from "./Title";
import { Clock } from "./Clock";
import { ConfirmButton, CancelButton } from "./Buttons";
//constants
import Dimensions from "../constants/Dimensions";
import Colors from "../constants/Colors";
//redux
import { useDispatch, useSelector } from "react-redux";
import { toggleAccess } from "../store/actions/access";
import { toggleOverlay } from "../store/actions/overlay";
export const ConfirmDialog = ({
  visible,
  toggleInnerOverlay,
  titleText,
  checkText,
  buttonText,
  isArriving,
}) => {
  const [check, setCheck] = useState(false);
  const toggleCheckBox = () => {
    setCheck(!check);
  };

  const dispatch = useDispatch();
  const manageOverlay = useSelector((state) => state.overlay);
  const ManageAccessHandler = () => {
    dispatch(toggleAccess());
    if (!isArriving) dispatch(toggleOverlay());
  };

  const toogleOuterOverlay = () => {
    dispatch(toggleOverlay());
  };

  const close = isArriving ? toggleInnerOverlay : toogleOuterOverlay;

  return (
    <Modal
      visible={isArriving ? visible : manageOverlay}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={close}>
        {/* Inner Pressable swallows taps so only the backdrop closes the dialog */}
        <Pressable style={styles.overlay}>
          <CancelButton onPress={close} />
          <View style={styles.container}>
            <Title size={30}>{titleText}</Title>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: check }}
              accessibilityLabel={checkText}
              onPress={toggleCheckBox}
              style={styles.check}
            >
              <View style={[styles.checkBox, check && styles.checkBoxChecked]}>
                {check ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text style={styles.checkText}>{checkText}</Text>
            </Pressable>
            <Clock />
            <View>
              <Text style={styles.notifyAdminText}>
                Se notificará a los administradores
              </Text>
            </View>
            <ConfirmButton
              buttonText={buttonText}
              onPress={ManageAccessHandler}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.height * 0.75,
    width: Dimensions.width * 0.8,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlay: {
    backgroundColor: Colors.dominant,
    borderRadius: 5,
    padding: 10,
    elevation: 5,
  },
  check: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.complementary,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBoxChecked: {
    backgroundColor: Colors.complementary,
  },
  checkMark: {
    color: Colors.accent,
    fontWeight: "bold",
  },
  checkText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notifyAdminText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
