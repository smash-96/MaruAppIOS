import { StyleSheet } from "react-native";

const dynamicStyles = () => {
  return StyleSheet.create({
    modalToggle: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#f2f2f2",
      padding: 10,
      borderRadius: 10,
      alignSelf: "center",
    },
    modalClose: {
      marginTop: 20,
      marginBottom: 0,
    },
    modalContent: {
      flex: 1,
    },
  });
};

export default dynamicStyles;
