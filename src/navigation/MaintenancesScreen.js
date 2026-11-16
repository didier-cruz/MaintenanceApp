import React from "react";
import { useSelector } from "react-redux";
import AssistanceScreen from "../screens/AssistanceScreen";
import TopTabs from "./TopTabs";

/**
 * Shows the attendance screen while the user is not inside a plantel,
 * and the Preventive/Corrective tabs once access has been granted.
 */
export default function MaintenancesScreen() {
  const access = useSelector((state) => state.access);
  return access ? <AssistanceScreen /> : <TopTabs />;
}
