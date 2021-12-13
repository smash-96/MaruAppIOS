import { StyleSheet, Dimensions } from "react-native";

const width = Dimensions.get("window").width; //full width
const dynamic_styles = () => {
  return StyleSheet.create({
    txtInput: {
      marginBottom: 10,
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      width: "85%",
      height: "6.5%",
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: 18,
      paddingLeft: "5%",
    },
    container: {
      flex: 1,
      backgroundColor: "#f2f4f7",
      alignItems: "center",
      justifyContent: "center",
    },
    //
    singleRow: {
      flexDirection: "row",
      backgroundColor: "#effdfe",
      alignSelf: "stretch",
      width: width,
      justifyContent: "space-between",
      margin: 1,
    },
    fields: {
      fontSize: 18,
      margin: 10,
      color: "grey",
    },
    left_fields: {
      fontSize: 18,
      margin: 10,
      color: "#1998ff",
    },
    action_sheet: {
      color: "#1998ff",
      fontSize: 20,
    },
    dob: {
      fontSize: 18,
      margin: 10,
      textAlign: "right",
      color: "black",
    },
  });
};

export default dynamic_styles;