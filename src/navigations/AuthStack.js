import React, { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SelectLanguage from "../components/Screens/Language/SelectLanguage";
import Login from "../components/Screens/Login/Login";
import Signup from "../components/Screens/Signup/Signup";
import LoadScreen from "../components/Screens/LoadScreen/LoadScreen";
import MapStack from "./MapStack";
import { createStackNavigator } from "@react-navigation/stack";
import { auth, db } from "../firebase/firebaseConfig";
import SplashScreen from "../components/Screens/SplashScreen/SplashScreen";
//import * as SplashScreen from "expo-splash-screen";
//import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function AuthStack(props) {
  // const [isLoading, setIsLoading] = useState(true);

  // if (isLoading) {
  //   // We haven't finished checking for the token yet
  //   return <SplashScreen />;

  //   //SplashScreen.hideAsync();
  // }

  return (
    <SafeAreaProvider>
      <Stack.Navigator
        screenOptions={{ animationEnabled: false, headerShown: false }}
        initialRouteName="LoadScreen"
      >
        <Stack.Screen
          name="LoadScreen"
          component={LoadScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SelectLanguage"
          component={SelectLanguage}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MapStack"
          component={MapStack}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}
