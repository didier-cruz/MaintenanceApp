import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Navigator from "./poc/Navigator";
import store, { hydrateStore } from "./store";
import { C } from "./poc/ui";

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrateStore().finally(() => setReady(true));
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={C.ink} />
        {ready ? (
          <Provider store={store}>
            <NavigationContainer>
              <Navigator />
            </NavigationContainer>
          </Provider>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={C.accent} size="large" />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = {
  root: { flex: 1 },
  loading: { flex: 1, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" },
};
