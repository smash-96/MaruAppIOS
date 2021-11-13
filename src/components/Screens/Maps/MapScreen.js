import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  // Button,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { Avatar, Icon } from "react-native-elements";
import { auth, db } from "../../../firebase/firebaseConfig";
import { copyDoc, moveDoc } from "../../../firebase/firebaseUtil";
import firestore from "@react-native-firebase/firestore";
import HelpForm from "../HelpDetailForm/HelpForm";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import Map from "../../Custom/Map";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "react-native-elements";
import {
  selectUserType,
  selectUserLocation,
  selectHelperLocation,
  setHelperLocation,
  selectHelpeeLocation,
  setHelpeeLocation,
} from "../../../slices/userInfoSlice";
import {
  setActiveRequestData,
  selectActiveRequestData,
} from "../../../slices/helpRequestSlice";
import uuid from "react-native-uuid";
// import haversine from "haversine";
// import TNActivityIndicator from "../../Custom/TNActivityIndicator/TNActivityIndicator";
import I18n from "../../../localization/utils/language";
const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE = 31.552094953842936;
const LONGITUDE = 74.34618461877108;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DEFAULT_PADDING = { top: 40, right: 40, bottom: 120, left: 40 };
//const userID = auth?.currentUser?.uid;

const MapScreen = (props) => {
  const dispatch = useDispatch();
  const userType = useSelector(selectUserType);
  const helpeeLocation = useSelector(selectHelpeeLocation);
  const helperLocation = useSelector(selectHelperLocation);
  const activeRequestData = useSelector(selectActiveRequestData);

  const [needHelp, setNeedHelp] = useState(true);
  const [giveHelp, setGiveHelp] = useState(true);
  const [helpeeModalOpen, setHelpeeModalOpen] = useState(false);
  const [helperModalOpen, setHelperModalOpen] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [helperModalData, setHelperModalData] = useState(null);
  const [refresh, doRefresh] = useState(0); // To trigger function in Map(child)
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const navigation = useNavigation();
  const [t_id, setT_id] = useState(null);

  useLayoutEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (activeRequestData) {
        if (activeRequestData.status === "open" && userType === "helpee") {
          setNeedHelp(false);
        } else if (activeRequestData.status === "InProgress") {
          if (userType === "helper") {
            setT_id(activeRequestData.helpeeID); // set helpee ID for helper to delete
            setNeedHelp(false);
            setGiveHelp(false);

            dispatch(setHelpeeLocation(activeRequestData.locationHelpee));
          } else {
            setNeedHelp(false);
          }
        }
      }
    }
    return () => {
      isMounted = false;
      //dispatch(setActiveRequestData(null));
    };
  }, []);

  useEffect(() => {
    const userID = props.route.params.user.uid;
    const cRef = db.collection("requests");
    const requestDelete = cRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        if (userType === "helpee" && userID === data.helpeeID) {
          if (change.type == "removed") {
            dispatch(setActiveRequestData(null));
            clearRequest();
          }
        } else if (
          userType === "helper" &&
          activeRequestData?.helpeeID === data.helpeeID
        ) {
          if (change.type == "removed") {
            console.log("REMOVED DATA", data);
            dispatch(setActiveRequestData(null));
            clearRequest();
          }
        }
      });
    });
    return requestDelete;
  });

  // useEffect(() => {
  //   if (activeRequestData && giveHelp) {
  //     dispatch(setActiveRequestData(null));
  //     dispatch(setHelpeeLocation(null));
  //   }
  // }, [giveHelp]);

  useEffect(() => {
    const userID = props.route.params.user.uid;
    const cRef = db.collection("requests").doc(userID);

    const unsubscribe = cRef.onSnapshot(async (snapshot) => {
      const data = await snapshot.data();

      if (data && data.status === "InProgress") {
        //2nd corrdinate set for helpee
        dispatch(
          setHelperLocation({
            latitude: data?.locationHelper?.latitude,
            longitude: data?.locationHelper?.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          })
        );
        setT_id(data?.helperID);

        const requestData = {
          ...activeRequestData,
          helperID: data?.helperID,
          status: "InProgress",
          locationHelper: helperLocation,
        };

        dispatch(setActiveRequestData(requestData));
        // let hName = (
        //   await db.collection("Users").doc(data.helperID).get()
        // ).data().fname;
        // Alert.alert(
        //   "Help Request Accepted!",
        //   hName + " has agreed to help you. He'll be here shortly!"
        // );
        console.log("Help Accepted");
        // set for helpee
        setGiveHelp(false);
      }
    });

    return unsubscribe;
  }, []);

  // const simulatedGetMapRegion = () => ({
  //   latitude: LATITUDE,
  //   longitude: LONGITUDE,
  //   latitudeDelta: LATITUDE_DELTA,
  //   longitudeDelta: LONGITUDE_DELTA,
  // });

  const broadcastRequest = async (request) => {
    setHelpeeModalOpen(false);
    setRequesting(true);
    try {
      const userID = props.route.params.user.uid;
      const { subject, details, time } = request;
      const requestData = {
        helpeeID: userID,
        helperID: null,
        status: "open",
        locationHelpee: helpeeLocation,
        locationHelper: null,
      };
      dispatch(setActiveRequestData(requestData));
      const cRef = db.collection("requests").doc(userID);
      cRef.set({
        helpeeID: userID,
        subject: subject || "NA",
        details: details || "NA",
        status: "open",
        locationHelpee: helpeeLocation,
        //locationHelpee: simulatedGetMapRegion(),
        ttl: time || "NA", // How soon does the helpee need help. E.g: within an hour
        timeStamp: firestore.FieldValue.serverTimestamp(),
      });
      db.collection("Users").doc(userID).update({
        helpRequestID: userID,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert(I18n.t("map.broadcast.header"), I18n.t("map.broadcast.body"));
    } catch (err) {
      console.log("Request Broadcast Error", err);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert("Request Broadcast Error", err);
    }

    setNeedHelp(false);
    setRequesting(false);
  };

  const helpeeAction = async () => {
    console.log("Need Help?");
    if (needHelp === true) {
      setHelpeeModalOpen(true);
    } else {
      // cancel button function
      setRequesting(true);

      try {
        clearRequest();

        await new Promise((resolve) => setTimeout(resolve, 2000));
        Alert.alert(I18n.t("map.cancel.header"), I18n.t("map.cancel.body"));
      } catch (err) {
        console.log("Helpee Request Cancellation Failed", err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        Alert.alert("Request Cancel Error", err);
      }

      setRequesting(false);
    }
  };

  const helperAction = async () => {
    console.log("Give Help?");
    if (giveHelp === true) {
      const requests = db.collection("requests");
      await requests
        .get()
        .then((querySnapshot) => {
          const tempDoc = [];
          querySnapshot.forEach((doc) => {
            tempDoc.push({ id: doc.id, ...doc.data() });
          });

          if (tempDoc.length !== 0) {
            for (let i = 0; i < tempDoc.length; i++) {
              if (tempDoc[i].status === "open") {
                // const start = {
                //   latitude: simulatedGetMapRegion().latitude,
                //   longitude: simulatedGetMapRegion().longitude,
                // };

                // Distance Code
                // const start = {
                //   latitude: helperLocation.latitude,
                //   longitude: helperLocation.longitude,
                // };

                // const end = {
                //   latitude: tempDoc[i].locationHelpee.latitude,
                //   longitude: tempDoc[i].locationHelpee.longitude,
                // };
                // let distance = haversine(start, end, {
                //   unit: "meter",
                // });
                // console.log("Distance", distance);
                // if (distance <= 10000) {
                //   setHelperModalData(tempDoc[i]);
                //   setHelperModalOpen(true);
                //   break;
                // }
                // else {
                //   Alert.alert(
                //     "No Request Available",
                //     "No help request is available in the system right now."
                //   );
                // }
                setHelperModalData(tempDoc[i]);
                setHelperModalOpen(true);
                break;
              }
              // else {
              //   Alert.alert(
              //     I18n.t("map.noReq.header"),
              //     I18n.t("map.noReq.body")
              //   );
              // }
            }
          } else {
            Alert.alert(I18n.t("map.noReq.header"), I18n.t("map.noReq.body"));
          }
        })
        .catch((err) => {
          console.log("Error", err);
        });
    } else {
      // set for helper
      setRequesting(true);

      try {
        clearRequest();

        await new Promise((resolve) => setTimeout(resolve, 2000));
        Alert.alert(I18n.t("map.cancel.header"), I18n.t("map.cancel.body"));
      } catch (err) {
        console.log("Helper Request Cancellation Failed", err);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        Alert.alert("Request Cancel Error", err);
      }

      setRequesting(false);
    }
  };

  const acceptRequest = async () => {
    setHelperModalOpen(false);
    setRequesting(true);

    try {
      const userID = props.route.params.user.uid;
      const requestData = {
        helpeeID: helperModalData.helpeeID,
        helperID: userID,
        status: "open",
        locationHelpee: helperModalData.locationHelpee,
        locationHelper: helperLocation,
      };
      dispatch(setActiveRequestData(requestData));

      const requests = await db.collection("requests");
      if (
        (await requests.doc(helperModalData.id).get()).data().status !=
        "InProgress"
      ) {
        requests.doc(helperModalData.id).update({
          helperID: userID,
          status: "InProgress",
          locationHelper: helperLocation,
          initialHelperLocation: helperLocation,
          //locationHelper: simulatedGetMapRegion(),
        });

        db.collection("Users").doc(userID).update({
          helpRequestID: helperModalData.helpeeID,
        });
        setT_id(helperModalData.helpeeID); // set helpee ID for helper to delete
        accept(helperModalData);
      } else {
        Alert.alert(
          "Request Not Available",
          "Someone else agreed to help this person. Kindly try again!"
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      console.log("Request Accept Error", err);
      Alert.alert("Request Accept Error", err);
    }

    setGiveHelp(false);
    setNeedHelp(false);
    setRequesting(false);
  };

  const accept = async (reqDoc) => {
    console.log("Request Accepted");
    //2nd corrdinate set for helper
    dispatch(
      setHelpeeLocation({
        latitude: reqDoc.locationHelpee.latitude,
        longitude: reqDoc.locationHelpee.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      })
    );

    // Alert.alert(
    //   "Request Accepted",
    //   "You have accepted to help someone in need."
    // );

    // set for helper
    // setGiveHelp(false);
    // setNeedHelp(false);
  };

  const clearRequest = async () => {
    await stateCleanUp();
    await firestoreCleanUp();
  };

  const stateCleanUp = async () => {
    // dispatch(setActiveRequestData(null));
    if (userType === "helper") {
      dispatch(setHelpeeLocation(null));
    } else if (userType === "helpee") {
      dispatch(setHelperLocation(null));
    }
    dispatch(setActiveRequestData(null));
    setNeedHelp(true);
    setGiveHelp(true);
    setT_id(null);
  };

  const firestoreCleanUp = async () => {
    const userID = props.route.params.user.uid;
    let cRef;
    //cRef = db.collection("requests").doc(t_id);
    if (userType === "helper") {
      console.log("DELETE USER ID helper", t_id);
      cRef = db.collection("requests").doc(t_id);
      try {
        if (cRef) {
          await cRef.delete();
          // await moveDoc(
          //   "requests",
          //   t_id,
          //   `CompletedRequests/${t_id}/AllRequests`,
          //   null,
          //   uuid.v4()
          // );
        }
      } catch (err) {
        console.log("ERROR1", err);
      }
    } else if (userType === "helpee") {
      console.log("DELETE USER ID helpee", userID);
      cRef = db.collection("requests").doc(userID);
      try {
        if (cRef) {
          await cRef.delete();
          // await moveDoc(
          //   "requests",
          //   userID,
          //   `CompletedRequests/${userID}/AllRequests`,
          //   null,
          //   uuid.v4()
          // );
        }
      } catch (err) {
        console.log("ERROR2", err);
      }
    }
    try {
      db.collection("Users").doc(userID).update({
        helpRequestID: "null",
      });
    } catch (err) {
      console.log("ERROR3", err);
    }
  };

  const enterChat = async () => {
    const userID = props.route.params.user.uid;
    //setLoading(true);
    const docData = await db.collection("Users").doc(t_id).get();
    if (docData) {
      navigation.navigate("Messages", {
        screen: "ConvoScreen",
        params: {
          id: t_id,
          uid: t_id,
          fname: docData?.data()?.fname,
          lname: docData?.data()?.lname,
          photo: docData?.data()?.photoUrl,
        },
      });

      // await copyDoc("Users", t_id, `Chats/${userID}/SelectedChats`, null, t_id);
      await copyDoc(
        "Users",
        t_id,
        `Chats/${userID}/SelectedChats`,
        { lastMessageTime: firestore.FieldValue.serverTimestamp() },
        t_id
      );

      //setLoading(true);
    } else {
      console.log("Data Fetch Error from Firebase!");
    }
  };

  return (
    <View>
      <Modal transparent={true} visible={helpeeModalOpen}>
        <View
          style={{
            marginTop: 50,
            justifyContent: "center",
          }}
        >
          <HelpForm
            onSubmit={(request) => broadcastRequest(request)}
            onClose={() => setHelpeeModalOpen(false)}
          />
        </View>
      </Modal>
      <Modal transparent={true} visible={helperModalOpen}>
        <View
          style={{
            marginTop: 50,
            justifyContent: "center",
          }}
        >
          <HelpForm
            onSubmit={acceptRequest}
            onClose={() => {
              setHelperModalData(null);
              setHelperModalOpen(false);
            }}
            data={helperModalData}
          />
        </View>
      </Modal>
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={tw`bg-gray-100 absolute top-8 left-6 z-50 p-3 rounded-full shadow-lg`}
      >
        <Icon name="menu" />
      </TouchableOpacity>
      <View style={tw`h-full`}>
        <Map tracking={tracking} refresh={refresh} />
      </View>

      <TouchableOpacity
        style={{
          position: "absolute",
          // alignSelf: "flex-end",
          bottom: 30,
          right: 20,
        }}
        onPress={() => doRefresh((prev) => prev + 1)}
      >
        <Image
          source={require("../../../assets/Current_Location.jpg")}
          style={{ height: 30, width: 30 }}
        />
      </TouchableOpacity>

      {requesting === true ? (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* {needHelp !== true ? (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              Requesting Help
            </Text>
          ) : (
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              Cancelling Help
            </Text>
          )} */}

          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            Connecting
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View
          style={{
            position: "absolute", //use absolute position to show button on bottom of the map
            bottom: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          {userType !== "helper" ? (
            <TouchableOpacity
              activeOpacity={0.825}
              style={{
                backgroundColor: "#2b88d1",
                borderColor: "#2b88d1",
                borderWidth: 20,
                borderRadius: 20,
              }}
              onPress={helpeeAction}
            >
              <View style={{ borderRadius: 0, borderWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    fontFamily: "verdana",
                    color: "white",
                    borderRadius: 0,
                    borderWidth: 0,
                  }}
                >
                  {needHelp === true
                    ? I18n.t("map.needHelp")
                    : I18n.t("map.cancelHelp")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.825}
              style={{
                backgroundColor: "#2b88d1",
                borderColor: "#2b88d1",
                borderWidth: 20,
                borderRadius: 20,
              }}
              onPress={helperAction}
            >
              <View style={{ borderRadius: 0, borderWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    fontFamily: "verdana",
                    color: "white",
                    borderRadius: 0,
                    borderWidth: 0,
                  }}
                >
                  {giveHelp === true
                    ? I18n.t("map.giveHelp")
                    : I18n.t("map.cancelHelp")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          {/* {helperLocation && helpeeLocation && userType === "helper" && (
          <Button
            title={tracking === false ? "Start Navigation" : "Stop Navigation"}
            onPress={startNavigation}
          />
        )} */}
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
        }}
      >
        {needHelp === false && giveHelp === false ? (
          <TouchableOpacity
            onPress={enterChat}
            style={{
              alignSelf: "flex-end",
              bottom: 80,
              right: 20,
            }}
          >
            <Avatar
              rounded
              size={60}
              source={{
                uri: "https://365psd.com/images/istock/previews/1063/106340965-chat-icon-vector-blue.jpg",
              }}
            />
          </TouchableOpacity>
        ) : (
          <View></View>
        )}
      </View>
      {/* {loading && <TNActivityIndicator />} */}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({});
