import React, { useState, useEffect } from "react";
import { ListItem, Avatar } from "react-native-elements";
import { auth, db } from "../../firebase/firebaseConfig";

export const CustomList = (props) => {
  const [messages, setMessages] = useState([]);

  const chatID = () => {
    const chatterID = auth?.currentUser?.uid;
    const chateeID = props.uid;
    const chatIDpre = [];
    chatIDpre.push(chatterID);
    chatIDpre.push(chateeID);
    chatIDpre.sort();
    return chatIDpre.join("_");
  };

  useEffect(() => {
    const unsubscribe = db
      .collection("messages")
      .doc(chatID())
      .collection("chats")
      .orderBy("timeStamp", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            data: doc.data(),
          }))
        );
      });

    return unsubscribe;
  }, []);

  return (
    <ListItem
      key={props.id}
      bottomDivider
      onPress={() =>
        props.enterChat(
          props.id,
          props.uid,
          props.fname,
          props.lname,
          props.photo
        )
      }
    >
      <Avatar
        rounded
        source={{
          uri: props.photo,
        }}
      />
      <ListItem.Content>
        <ListItem.Title>
          {props.fname} {props.lname}
        </ListItem.Title>
        <ListItem.Subtitle
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            //fontWeight: "bold",
            color: "black",
          }}
        >
          {messages?.[0]?.data.message}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};
