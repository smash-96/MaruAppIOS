import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableNativeFeedback,
  ScrollView,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import MapScreen from "../components/Screens/Maps/MapScreen";
import ProfileScreen from "../components/Screens/Profile/ProfileScreen";
import SettingScreen from "../components/Screens/Settings/SettingScreen";
import UserAvatar from "../components/Custom/UserAvatar/UserAvatar";
import { useSelector } from "react-redux";
import { selectUserPhoto, selectFirstSignup } from "../slices/userInfoSlice";
import ChatStack from "./ChatStack";
import { auth } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import I18n from "../localization/utils/language";
function CustomDrawerContent(props) {
  const navigation = useNavigation();
  const userPhoto = useSelector(selectUserPhoto);
  const baseAvatar =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [profilePic, setProfilePic] = useState(baseAvatar || "");

  const ripple = TouchableNativeFeedback.Ripple("#adacac", false);

  useLayoutEffect(() => {
    if (userPhoto !== null) {
      setProfilePic(userPhoto);
    }
  }, [userPhoto, profilePic]);

  const logout = () => {
    console.log("Logout");
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
        console.log("Navigate to login!");
      })
      .catch((err) => {
        console.log("Error in siging out!", err);
      });
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <SafeAreaView
          style={{ flex: 1 }}
          forceInset={{ top: "always", horizontal: "never" }}
        >
          <View
            style={[
              { paddingTop: "8%", paddingBottom: "4%" },
              { backgroundColor: "#2c88d1" },
            ]}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <UserAvatar profilePic={profilePic} drawer={true} />
              <Text
                style={{
                  color: "#f9f9f9",
                  marginTop: "3%",
                  fontFamily: "sans-serif-condensed",
                  fontSize: 20,
                }}
              >
                {I18n.t("drawer.hello")} {auth?.currentUser?.displayName}
              </Text>
              <Text
                style={{
                  color: "#f9f9f9",
                  fontFamily: "sans-serif-condensed",
                  fontSize: 15,
                }}
              >
                {auth?.currentUser?.email}
              </Text>
            </View>
          </View>

          <DrawerItemList {...props} />
          <DrawerItem
            label={I18n.t("drawer.logout")}
            onPress={logout}
            icon={({ focused, size }) => (
              <Icon
                name="logout"
                type="MaterialCommunityIcons"
                size={size}
                color={focused ? "#2c88d1" : "#ccc"}
              />
            )}
            labelStyle={{ fontSize: 20, color: "black" }}
          />
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const Drawer = createDrawerNavigator();

const MapStack = (props) => {
  let routeName;
  const firstSignup = useSelector(selectFirstSignup);
  if (firstSignup === "true") {
    routeName = "MapScreen";
  } else if (firstSignup === "false") {
    routeName = "ProfileScreen";
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: "white",
        },
      }}
      initialRouteName={routeName}
    >
      <Drawer.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        //initialParams={{ user: props.route.params.user }}
        options={{
          unmountOnBlur: true,
          drawerLabel: ({ focused, size }) => (
            <Text
              style={{
                fontSize: 20,
                color: "black",
              }}
            >
              {"  "}
              {I18n.t("drawer.profile")}
            </Text>
          ),
          drawerActiveTintColor: "#2c88d1",
          drawerIcon: ({ focused, size }) => (
            <Icon
              name="user"
              type="font-awesome"
              size={size}
              color={focused ? "#2c88d1" : "#ccc"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="MapScreen"
        component={MapScreen}
        initialParams={{ user: props.route.params.user }}
        options={{
          headerShown: false,
          drawerLabel: ({ focused, size }) => (
            <Text style={{ fontSize: 20, color: "black" }}>
              {"  "}
              {I18n.t("drawer.map")}
            </Text>
          ),
          drawerActiveTintColor: "#2c88d1",
          drawerIcon: ({ focused, size }) => (
            <Icon
              name="map-marker-alt"
              type="fontisto"
              size={size}
              color={focused ? "#2c88d1" : "#ccc"}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Messages"
        component={ChatStack}
        options={{
          headerShown: false,
          drawerLabel: ({ focused, size }) => (
            <Text style={{ fontSize: 20, color: "black" }}>
              {I18n.t("drawer.chat")}
            </Text>
          ),
          drawerActiveTintColor: "#2c88d1",
          drawerIcon: ({ focused, size }) => (
            <Icon
              name="rocketchat"
              type="font-awesome-5"
              size={size}
              color={focused ? "#2c88d1" : "#ccc"}
            />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="SettingScreen"
        component={SettingScreen}
        options={{
          headerShown: false,
          drawerLabel: ({ focused, size }) => (
            <Text style={{ fontSize: 20, color: "black" }}>Settings</Text>
          ),
          drawerActiveTintColor: "#2c88d1",
          drawerIcon: ({ focused, size }) => (
            <Icon
              name="md-settings-outline"
              type="ionicon"
              size={size}
              color={focused ? "#2c88d1" : "#ccc"}
            />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default MapStack;

//const styles = StyleSheet.create({});
