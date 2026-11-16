import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Dimensions from "../constants/Dimensions";
import Colors from "../constants/Colors";
//screens
import AnnounceScreen from "../screens/AnnounceScreen";
import MaintenancesScreen from "./MaintenancesScreen";
//constants
import { ScreensEnum } from "../constants/enum/ScreensEnum";

const BottomTab = createBottomTabNavigator();
const TabBarHeight = Dimensions.height * 0.1;
const IconHeight = TabBarHeight / 2;
const LabelHeight = IconHeight / 2.5;

const { Maintenances, Dashboards } = ScreensEnum.BottomTabs;

const renderTabBarIcon =
  (routeName) =>
  ({ color }) =>
    routeName === Maintenances ? (
      <FontAwesome name="cogs" color={color} size={IconHeight} />
    ) : (
      <MaterialIcons name="pie-chart" color={color} size={IconHeight} />
    );

export default function BottomTabs() {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: styles.style,
        tabBarLabelStyle: styles.labelStyle,
        tabBarIcon: renderTabBarIcon(route.name),
      })}
    >
      <BottomTab.Screen
        name={Maintenances}
        component={MaintenancesScreen}
        options={{ tabBarLabel: "Mantenimientos" }}
      />
      <BottomTab.Screen
        name={Dashboards}
        component={AnnounceScreen}
        options={{ tabBarLabel: "Informes" }}
      />
    </BottomTab.Navigator>
  );
}

const styles = StyleSheet.create({
  style: {
    backgroundColor: Colors.complementary,
    height: TabBarHeight,
    padding: 10,
  },
  labelStyle: {
    fontSize: LabelHeight,
    marginBottom: 10,
  },
});
