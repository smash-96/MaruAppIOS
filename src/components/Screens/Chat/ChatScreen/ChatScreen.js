import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Text,
  NativeModules,
  LayoutAnimation,
  UIManager,
  BackHandler,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CustomList } from "../../../Custom/CustomList";
//import dynamicStyles from "./styles";
import { Avatar, Icon } from "react-native-elements";
import { auth, db } from "../../../../firebase/firebaseConfig";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

//import tw from "tailwind-react-native-classnames";

//const { LaunchManager } = NativeModules;

// if (Platform.OS === "android") {
//   if (UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
//   }
// }

const ChatScreen = (props) => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);

  // My changes
  useEffect(() => {
    const unsubscribe = db
      .collection("Chats")
      .doc(auth?.currentUser?.uid)
      .collection("SelectedChats")
      .orderBy("lastMessageTime", "desc")
      .onSnapshot((snapshot) => {
        // LayoutAnimation.configureNext({
        //   duration: 50,
        //   create: {
        //     type: LayoutAnimation.Types.easeInEaseOut,
        //     property: LayoutAnimation.Properties.opacity,
        //   },
        //   update: { type: LayoutAnimation.Types.easeInEaseOut },
        // });

        setChats(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );
      });

    return unsubscribe;
  }, []);
  //

  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: "MARU Chat",
      headerStyle: { backgroundColor: "#2c88d1" },
      headerTitleStyle: { color: "white" },
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            activeOpacity={0.5}
          >
            <Icon name="menu" />
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={tw`bg-gray-100 absolute top-16 left-8 z-50 p-3 rounded-full shadow-lg`}
          >
            <Icon name="menu" />
          </TouchableOpacity> */}
        </View>
      ),
      headerRight: () => (
        <View style={{ marginRight: 20 }}>
          <TouchableOpacity>
            <Avatar
              rounded
              source={require("../../../../assets/MessageLogo.png")}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // props.navigation.replace("MapStack", {
        //   screen: "MapScreen",
        // });
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

  const enterChat = (id, uid, fname, lname, photo) => {
    props.navigation.navigate("ConvoScreen", {
      id: id,
      uid: uid,
      fname: fname,
      lname: lname,
      photo: photo,
    });
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "#effdff" }}>
      {chats.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "dodgerblue",
            }}
          >
            You have no connections yet!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item }) => (
            <CustomList
              key={item.id}
              id={item.id}
              uid={item.data.uid}
              fname={item.data.fname}
              lname={item.data.lname}
              photo={item.data.photoUrl}
              enterChat={enterChat}
            />
          )}
        />
      )}
    </SafeAreaProvider>
  );
};

export default ChatScreen;
