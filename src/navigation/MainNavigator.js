import React, { memo } from "react";
import { StyleSheet } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useDispatch, useSelector } from "react-redux";
import BottomTabs from "./BottomTabs";
import Dimensions from "../constants/Dimensions";
import Colors from "../constants/Colors";
import { ExitButton } from "../components/Buttons";
//screens
import ScannerScreen from "../screens/ScannerScreen";
//redux
import { toggleOverlay } from "../store/actions/overlay";
//constants
import { ScreensEnum } from "../constants/enum/ScreensEnum";

const Stack = createStackNavigator();
const BottomTabsMemo = memo(BottomTabs);
const HeaderHeight = Dimensions.height * 0.1;
const HeaderTitleHeight = HeaderHeight / 3.5;

const { Home, Scanner } = ScreensEnum.MainNavigator;
const { Maintenances, Dashboards } = ScreensEnum.BottomTabs;

/**
 * Gets the header title from the focused BottomTabs route name.
 * @param {object} route - Route object
 * @returns {string|undefined} The title
 */
function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route);

  switch (routeName) {
    case Maintenances:
    case Dashboards:
    default:
      return "Lafarge Holcim";
  }
}

/** Exit button, only visible while the user is inside a plantel. */
function HeaderExitButton() {
  const dispatch = useDispatch();
  const access = useSelector((state) => state.access);
  if (access) {
    return null;
  }
  return <ExitButton text="Salida" onPress={() => dispatch(toggleOverlay())} />;
}

const renderHeaderRight = () => <HeaderExitButton />;

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName={Home}>
      <Stack.Screen
        name={Home}
        component={BottomTabsMemo}
        options={({ route }) => ({
          title: "Lafarge Holcim",
          headerTitle: getHeaderTitle(route),
          headerTintColor: Colors.dominant,
          headerStyle: styles.headerStyle,
          headerTitleStyle: styles.headerTitleStyle,
          headerRight: renderHeaderRight,
        })}
      />
      <Stack.Screen
        name={Scanner}
        component={ScannerScreen}
        options={{
          title: "",
          headerShown: true,
          headerStyle: styles.scannerHeaderStyle,
          headerTintColor: Colors.dominant,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    height: HeaderHeight,
    backgroundColor: Colors.complementary,
  },
  scannerHeaderStyle: {
    height: HeaderHeight,
    backgroundColor: Colors.complementary,
    opacity: 0.7,
  },
  headerTitleStyle: {
    fontSize: HeaderTitleHeight,
  },
});
