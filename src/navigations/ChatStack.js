import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatScreen from "../components/Screens/Chat/ChatScreen/ChatScreen";
import ConvoScreen from "../components/Screens/Chat/ConvoScreen/ConvoScreen";

const Stack = createStackNavigator();

const ChatStack = () => {
  return (
    <Stack.Navigator initialRouteName={"ChatScreen"}>
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        //options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ConvoScreen"
        component={ConvoScreen}
        //options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ChatStack;

//const styles = StyleSheet.create({})
