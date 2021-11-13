import "react-native-gesture-handler";
import React, { useEffect } from "react";
import AuthStack from "./src/navigations/AuthStack";
import { NavigationContainer } from "@react-navigation/native";
import { IMAVAppCallWrapper } from "./src/components/avchat";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
};

const MainNavigator = IMAVAppCallWrapper(AppNavigator);

const App = () => {
  return (
    <MainNavigator />
    // <NavigationContainer>
    //   <AuthStack />
    // </NavigationContainer>
  );
};

export default App;
