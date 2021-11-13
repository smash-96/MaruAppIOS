/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { NativeModules } from "react-native";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import messaging from "@react-native-firebase/messaging";
import RNCallKeep from "react-native-callkeep";

const maruApp = () => (
    <Provider store={store}>
      <App />
    </Provider>
  );

AppRegistry.registerComponent(appName, () => maruApp);
