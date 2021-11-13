import React, { useEffect, useRef } from "react";
import { View, Keyboard } from "react-native";
import deviceStorage from "../../Utils/AuthDeviceStorage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../../firebase/firebaseConfig";
import authManager from "../../Utils/AuthManager";
import NotifService from "../../../notifictions/NotifService";
import { useDispatch } from "react-redux";
import { setUserLanguage, setFirstSignup } from "../../../slices/userInfoSlice";
import { setLocale } from "../../../localization/utils/language";

const LoadScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const didFocusSubscription = useRef(
    navigation.addListener("focus", (payload) => {
      setAppState();
    })
  );

  useEffect(() => {
    setAppState();
    return () => {
      didFocusSubscription.current && didFocusSubscription.current(); // This functions is returned by navigator to unsubscribe from the event
    };
  }, []);

  const setAppState = async () => {
    const shouldShowOnboardingFlow =
      await deviceStorage.getShouldShowOnboardingFlow();
    if (!shouldShowOnboardingFlow) {
      const appLanguage = await deviceStorage.getAppLanguage();
      const firstSignup = await deviceStorage.getFirstSignup();
      dispatch(setUserLanguage(appLanguage));
      setLocale(appLanguage);
      dispatch(setFirstSignup(firstSignup));
      if (auth?.currentUser) {
        fetchPersistedUserIfNeeded();
        return;
      }
      navigation.navigate("Login");
    } else {
      const notif = new NotifService();
      navigation.navigate("SelectLanguage");
    }
  };

  // Case when user is already logged in
  const fetchPersistedUserIfNeeded = async () => {
    authManager
      .retrievePersistedAuthUser()
      .then((response) => {
        if (response?.user) {
          //console.log("USER", response?.user);
          //   dispatch(
          //     setUserData({
          //       user: response.user,
          //     })
          //   );
          Keyboard.dismiss();
        }
        navigation.navigate("Login");
      })
      .catch((error) => {
        console.log(error);
        navigation.navigate("Login");
      });
  };

  return <View />;
};

export default LoadScreen;
