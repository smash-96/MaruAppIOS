import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";
import { Avatar } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import dynamic_styles from "./styles";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from "react-native";
import { auth, db } from "../../../../firebase/firebaseConfig";
import firestore from "@react-native-firebase/firestore";
import { initiateAVCall } from "../../../avchat";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { selectUserData } from "../../../../slices/userAuthSlice";

const ConvoScreen = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const styles = dynamic_styles();
  const currentUser = useSelector(selectUserData);

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerTitleAlign: "left",
      headerStyle: { backgroundColor: "#2c88d1" },
      headerTitleStyle: { color: "white" },
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar
            rounded
            source={{
              uri:
                props.route.params.photo ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            }}
          />
          <Text
            style={{
              marginLeft: 10,
              fontWeight: "700",
              color: "white",
              fontSize: 16,
            }}
          >
            {props.route.params.fname} {props.route.params.lname}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.replace("ChatScreen");
            }}
            activeOpacity={0.5}
          >
            <Avatar
              rounded
              // source={{
              //   uri: "https://img.icons8.com/ios/452/long-arrow-left.png",
              // }}
              source={require("../../../../assets/backChat.png")}
            />
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 80,
            marginRight: 20,
          }}
        >
          <TouchableOpacity onPress={audioCall} activeOpacity={0.5}>
            <Avatar
              rounded
              // source={{
              //   uri: "https://cdn.icon-icons.com/icons2/2440/PNG/512/phone_call_icon_148513.png",
              // }}
              source={require("../../../../assets/audiocall.png")}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={videoCall} activeOpacity={0.5}>
            <Avatar
              // source={{
              //   uri: "https://img.icons8.com/ios/452/video-call.png",
              // }}
              source={require("../../../../assets/videocall.png")}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]); // Update or reloads useEffect when dependent values are changed

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        props.navigation.replace("ChatScreen");
        // Return true to stop default back navigaton
        // Return false to keep default back navigaton
        console.log("Back Pressed");
        return true;
      };

      // Add Event Listener for hardwareBackPress
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        // Once the Screen gets blur Remove Event Listener
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  // For Caller
  const videoCall = () => {
    console.log("Video Call");
    initiateAVCall(
      {
        participants: [
          { uid: auth?.currentUser?.uid },
          {
            uid: props.route.params.uid,
            photoUrl: props.route.params.photo,
            fname: props.route.params.fname,
            lname: props.route.params.lname,
          },
        ],
      },
      "video",
      currentUser.user,
      dispatch
    );
  };

  // For Caller
  const audioCall = async () => {
    console.log("Audio Call");
    initiateAVCall(
      {
        participants: [
          { uid: auth?.currentUser?.uid },
          {
            uid: props.route.params.uid,
            photoUrl: props.route.params.photo,
            fname: props.route.params.fname,
            lname: props.route.params.lname,
          },
        ],
      },
      "audio",
      currentUser.user,
      dispatch
    );
  };

  const chatID = () => {
    const chatterID = auth?.currentUser?.uid;
    const chateeID = props.route.params.uid;
    const chatIDpre = [];
    chatIDpre.push(chatterID);
    chatIDpre.push(chateeID);
    chatIDpre.sort();
    return chatIDpre.join("_");
  };

  const sendMessage = async () => {
    if (msg !== "") {
      let currMsg = msg;
      setMsg("");
      Keyboard.dismiss();
      const currentTime = firestore.FieldValue.serverTimestamp();
      const msgRef = db.collection("messages").doc(chatID());

      await msgRef.collection("chats").add({
        timeStamp: currentTime,
        message: currMsg,
        senderID: auth?.currentUser?.uid,
        recieverID: props.route.params.uid,
      });

      try {
        await db
          .collection("Chats")
          .doc(props.route.params.uid)
          .collection("SelectedChats")
          .doc(auth?.currentUser?.uid)
          .update({
            lastMessageTime: currentTime,
          });

        await db
          .collection("Chats")
          .doc(auth?.currentUser?.uid)
          .collection("SelectedChats")
          .doc(props.route.params.uid)
          .update({
            lastMessageTime: currentTime,
          });
      } catch (err) {
        console.log("List not Created yet Error!");
      }
    }
  };

  useLayoutEffect(() => {
    const unsubscribe = db
      .collection("messages")
      .doc(chatID())
      .collection("chats")
      .orderBy("timeStamp", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );
      });

    return unsubscribe;
  }, [props.route]);

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <>
            <FlatList
              data={messages}
              renderItem={({ item }) => {
                if (item.data.senderID === auth?.currentUser?.uid) {
                  return (
                    <View key={item.id} style={styles.sender}>
                      <Avatar
                        rounded
                        position="absolute"
                        bottom={-15}
                        right={-5}
                        size={30}
                        source={{
                          uri:
                            auth?.currentUser?.photoURL ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                        }}
                      />
                      <Text style={styles.senderText}>{item.data.message}</Text>
                    </View>
                  );
                } else {
                  return (
                    <View key={item.id} style={styles.reciever}>
                      <Avatar
                        rounded
                        position="absolute"
                        bottom={-15}
                        left={-5}
                        size={30}
                        source={{
                          uri:
                            props.route.params.photo ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                        }}
                      />
                      <Text style={styles.recieverText}>
                        {item.data.message}
                      </Text>
                    </View>
                  );
                }
              }}
              inverted={true}
            />
            <View style={styles.footer}>
              <TextInput
                style={styles.textInput}
                placeholder="Text me"
                onChangeText={(msg) => setMsg(msg)}
                value={msg}
              />
              <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
                <Avatar
                  rounded
                  // source={{
                  //   uri: "https://image.flaticon.com/icons/png/512/3682/3682321.png",
                  // }}
                  source={require("../../../../assets/MessageSend.png")}
                />
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default ConvoScreen;
