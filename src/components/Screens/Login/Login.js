import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  TextInput,
  Alert,
  AppState,
  Keyboard,
  Platform,
} from "react-native";
import Authentication_Button from "../../Custom/AuthenticationButton";
import { SocialIcon } from "react-native-elements";
import { Container, Content } from "native-base";
import dynamic_styles from "./LoginStyles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scrollview";
import { auth, db } from "../../../firebase/firebaseConfig";
import messaging from "@react-native-firebase/messaging";
import I18n from "../../../localization/utils/language";
import authManager from "../../Utils/AuthManager";
import TNActivityIndicator from "../../Custom/TNActivityIndicator/TNActivityIndicator";
import { useDispatch } from "react-redux";
import {
  setUserType,
  setUserPhoto,
  setUserFname,
  setUserLname,
  setUserEmail,
  setUserAddress,
  setUserGender,
  setUserAge,
} from "../../../slices/userInfoSlice";
import { setUserData, selectUserData } from "../../../slices/userAuthSlice";
import { setActiveRequestData } from "../../../slices/helpRequestSlice";
import { showMessage, hideMessage } from "react-native-flash-message";
//import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email cannot be empty")
    .matches(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Email not valid"
    ),
  pass: yup.string().required("Password cannot be empty").min(8),
});

const Login = (props) => {
  const styles = dynamic_styles();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // New code
  useEffect(() => {
    registerOnNotificationOpenedApp();
    AppState.addEventListener("change", handleAppStateChange);
    tryToLoginFirst();
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    console.log("handleAppStateChange", nextAppState);
    // if (Platform.OS === "android") {
    //   if (nextAppState === "background") {
    //     deactivateKeepAwake();
    //   } else {
    //     activateKeepAwake();
    //   }
    // }
    const intialNotification = await messaging().getInitialNotification();

    if (intialNotification && Platform.OS === "android") {
      console.log(
        "Notification caused app to open from quit state:",
        intialNotification
      );
      // if (remoteMessage.data.type === "message") {
      //   props.navigation.replace(remoteMessage.data.screen, {
      //     //id: id,
      //     uid: remoteMessage.data.uid,
      //     fname: remoteMessage.data.fname,
      //     lname: remoteMessage.data.lname,
      //     //photo: photo,
      //   });
      // }
    }
  };

  const tryToLoginFirst = async () => {
    authManager
      .retrievePersistedAuthUser()
      .then(async (response) => {
        if (response?.user) {
          const user = response.user;
          if (!user.emailVerified) {
            // auth.currentUser.updateProfile({
            //   photoURL: user.photoUrl,
            // });
            const requestID = (
              await db.collection("Users").doc(user.uid).get()
            ).data().helpRequestID;
            if (requestID !== "null") {
              const requestData = (
                await db.collection("requests").doc(requestID).get()
              ).data();
              dispatch(setActiveRequestData(requestData));
            } else {
              dispatch(setActiveRequestData(null));
            }

            // console.log("LOGIN USER", user);
            // delete user["createdAt"];
            // delete user["lastOnlineTimestamp"];
            //console.log("USER_NEW", user);
            dispatch(setUserData({ user }));

            if (user.photoUrl) {
              dispatch(setUserPhoto(user.photoUrl));
            }
            if (user.userType) {
              dispatch(setUserType(user.userType));
            } else {
              dispatch(setUserType(""));
            }
            if (user.Gender) {
              dispatch(setUserGender(user.Gender));
            } else {
              dispatch(setUserGender(""));
            }

            if (user.fname) {
              dispatch(setUserFname(user.fname));
            }
            if (user.lname) {
              dispatch(setUserLname(user.lname));
            }
            if (user.email) {
              dispatch(setUserEmail(user.email));
            }
            if (user.Address) {
              dispatch(setUserAddress(user.Address));
            }

            if (user.Age) {
              dispatch(setUserAge(user.Age));
            }
            //
            Keyboard.dismiss();
            props.navigation.reset({
              index: 0,
              routes: [
                {
                  name: "MapStack",
                  params: { user: user },
                },
              ],
            });
            return;
          }
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const registerOnNotificationOpenedApp = async () => {
    console.log("registerOnNotificationOpenedApp");
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          "Notification caused app to open from quit state:",
          remoteMessage
        );
        // if (remoteMessage.data.type === "message") {
        //   props.navigation.replace(remoteMessage.data.screen, {
        //     //id: id,
        //     uid: remoteMessage.data.uid,
        //     fname: remoteMessage.data.fname,
        //     lname: remoteMessage.data.lname,
        //     //photo: photo,
        //   });
        // }
      }
    });
    messaging().onMessage((remoteMessage) => {
      // if (remoteMessage && Platform.OS === "ios") {
      //   const userID = currentUser?.id || currentUser?.userID;
      //   updateUser(userID, { badgeCount: 0 });
      // }
      if (remoteMessage && remoteMessage.data.type === "message") {
        // console.log(
        //   "current navigation route",
        //   navigation.getState().routeNames
        // );
        showMessage({
          message: remoteMessage.data.fname,
          description: remoteMessage.data.userMsg,
          type: "default",
          backgroundColor: "white", // background color
          color: "black", // text color
        });
      }
    });
  };
  //
  // useEffect(() => {
  //   if (auth?.currentUser) {
  //     auth.signOut();
  //   }
  // }, []);

  const login = (values, actions) => {
    console.log("LOGIN");
    setLoading(true);
    authManager
      .loginWithEmailAndPassword(values.email, values.pass)
      .then(async (response) => {
        if (response?.user) {
          const user = response.user;

          if (!user.emailVerified) {
            // auth.currentUser.updateProfile({
            //   photoURL: user.photoUrl,
            // });
            const requestID = (
              await db.collection("Users").doc(user.uid).get()
            ).data().helpRequestID;
            if (requestID !== "null") {
              const requestData = (
                await db.collection("requests").doc(requestID).get()
              ).data();
              dispatch(setActiveRequestData(requestData));
            } else {
              dispatch(setActiveRequestData(null));
            }

            // delete user["createdAt"];
            // delete user["lastOnlineTimestamp"];
            //console.log("USER_NEW", user);
            dispatch(setUserData({ user }));
            //
            if (user.photoUrl) {
              dispatch(setUserPhoto(user.photoUrl));
            }
            if (user.userType) {
              dispatch(setUserType(user.userType));
            } else {
              dispatch(setUserType(""));
            }
            if (user.Gender) {
              dispatch(setUserGender(user.Gender));
            } else {
              dispatch(setUserGender(""));
            }

            if (user.fname) {
              dispatch(setUserFname(user.fname));
            }
            if (user.lname) {
              dispatch(setUserLname(user.lname));
            }
            if (user.email) {
              dispatch(setUserEmail(user.email));
            }
            if (user.Address) {
              dispatch(setUserAddress(user.Address));
            }

            if (user.Age) {
              dispatch(setUserAge(user.Age));
            }
            //
            Keyboard.dismiss();
            props.navigation.reset({
              index: 0,
              routes: [
                {
                  name: "MapStack",
                  params: { user: user },
                },
              ],
            });
          } else {
            auth.signOut();
            setLoading(false);
            Alert.alert(
              I18n.t("login.alert.header"),
              I18n.t("login.alert.body"),
              [I18n.t("login.alert.button")],
              {
                cancelable: false,
              }
            );
          }
        } else {
          setLoading(false);
          console.log("SOME ERROR");
          Alert.alert(
            I18n.t("login.alert2.header"),
            I18n.t("login.alert2.body"),
            [I18n.t("login.alert.button")],
            {
              cancelable: false,
            }
          );
        }
      });

    //actions.resetForm();
  };

  const googleLogin = () => {
    console.log("Google Signup");
    setLoading(true);
    authManager.loginOrSignUpWithGoogle().then((response) => {
      if (response?.user) {
        const user = response.user;
        dispatch(setUserData({ user }));
        Keyboard.dismiss();
        props.navigation.reset({
          index: 0,
          routes: [
            {
              name: "MapStack",
              //params: { user: user }
            },
          ],
        });
      } else {
        setLoading(false);
        Alert.alert("", response.error, [{ text: "OK" }], {
          cancelable: false,
        });
      }
    });
  };

  const signup = () => {
    props.navigation.navigate("Signup");
  };

  if (isLoading == true) {
    return <TNActivityIndicator />;
  }

  return (
    <KeyboardAwareScrollView>
      <Container>
        <Content
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          {/* Footer Image */}
          <View style={styles.footerImage}>
            <Image source={require("../../../assets/footLogin.png")} />
          </View>
          {/* Logo at the top  */}
          <Image
            source={require("../../../assets/Logo.png")}
            style={styles.logo}
          />

          <Formik
            initialValues={{ email: "", pass: "" }}
            validationSchema={loginSchema}
            onSubmit={login}
          >
            {(formikProps) => (
              <>
                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t("login.emailPlaceholder")}
                  type="email"
                  onChangeText={formikProps.handleChange("email")}
                  onBlur={formikProps.handleBlur("email")}
                  value={formikProps.values.email}
                  keyboardType="email-address"
                />
                {/* <Text style={styles.error}>
                  {formikProps.touched.email && formikProps.errors.email}
                </Text> */}

                <TextInput
                  style={styles.txtInput}
                  placeholder={I18n.t("login.passPlaceholder")}
                  type="password"
                  secureTextEntry={true}
                  onChangeText={formikProps.handleChange("pass")}
                  value={formikProps.values.pass}
                />

                {/* <Text style={styles.error}>
                  {formikProps.touched.pass && formikProps.errors.pass}
                </Text> */}

                <View style={styles.authenticationButton}>
                  <Authentication_Button
                    title={I18n.t("login.login")}
                    backGroundColor={"#2c88d1"}
                    textColor={"#FFFFFF"}
                    borderColor={"#2c88d1"}
                    handlePress={formikProps.handleSubmit}
                  />
                </View>
              </>
            )}
          </Formik>

          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {I18n.t("login.signupText")}
              <Text
                style={{
                  // fontSize: 16,
                  fontWeight: "bold",
                  color: "blue",
                }}
                onPress={signup}
              >
                {" "}
                {I18n.t("login.eText")}
              </Text>
            </Text>
            {/* <Authentication_Button
              title={I18n.t("login.signup")}
              backGroundColor={"#FFFFFF"}
              textColor={"#2c88d1"}
              borderColor={"#2c88d1"}
              handlePress={signup}
            /> */}
          </View>

          {/* <Text>- {I18n.t("login.or")} -</Text>
          <Text>{I18n.t("login.atext")} </Text> */}

          {/* Google logo for sign in */}
          {/* <SocialIcon
            raised={true}
            type="google"
            style={{ backgroundColor: "#2c88d1" }}
            onPress={googleLogin}
          /> */}
        </Content>
      </Container>
      {loading && <TNActivityIndicator />}
    </KeyboardAwareScrollView>
  );
};

export default Login;
