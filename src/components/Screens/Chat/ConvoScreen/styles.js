import { StyleSheet } from "react-native";

const dynamic_styles = () => {
  return StyleSheet.create({
    container: { flex: 1 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      padding: 15,
    },
    textInput: {
      bottom: 0,
      height: 40,
      flex: 1,
      marginRight: 15,
      borderColor: "transparent",
      backgroundColor: "#ECECEC",
      //borderWidth: 1,
      padding: 10,
      color: "black",
      borderRadius: 30,
      fontSize: 15,
    },
    sender: {
      padding: 15,
      backgroundColor: "#2c88d1",
      alignSelf: "flex-end",
      borderRadius: 20,
      marginRight: 15,
      marginBottom: 20,
      maxWidth: "80%",
      position: "relative",
    },
    senderText: {
      color: "black",
      fontWeight: "500",
      marginRight: 10,
    },
    reciever: {
      padding: 15,
      backgroundColor: "#ECECEC",
      alignSelf: "flex-start",
      borderRadius: 20,
      margin: 15,
      maxWidth: "80%",
      position: "relative",
    },
    recieverText: {
      color: "black",
      fontWeight: "500",
      marginLeft: 10,
    },
  });
};

export default dynamic_styles;
