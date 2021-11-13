import { StyleSheet } from "react-native";

const dynamicStyles = () => {
  return StyleSheet.create({
    // subject: {
    //   borderWidth: 1,
    //   borderColor: "#ddd",
    //   padding: 10,
    //   fontSize: 18,
    //   borderRadius: 6,
    //   top: 10,
    // },
    // details: {
    //   borderWidth: 1,
    //   borderColor: "#ddd",
    //   padding: 10,
    //   fontSize: 18,
    //   borderRadius: 6,
    //   height: "50%",
    //   top: 20,
    // },
    // time: {
    //   borderWidth: 1,
    //   borderColor: "#ddd",
    //   padding: 10,
    //   fontSize: 18,
    //   borderRadius: 6,
    //   top: 30,
    // },
    // buttons: {
    //   top: 40,
    // },

    //
    centeredView: {
      //flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 15,
    },
    modalView: {
      width: "80%",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    buttonOpen: {
      backgroundColor: "#F194FF",
    },
    buttonClose: {
      backgroundColor: "#cf2337",
    },
    buttonSubmit: {
      backgroundColor: "#2196F3",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 16,
    },
    Detailsinput: {
      borderWidth: 1.5,
      borderRadius: 12.5,
      padding: 10,

      textAlignVertical: "top",
      fontSize: 16,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1.5,
      borderRadius: 12.5,
      padding: 10,
      paddingTop: 0,
      paddingBottom: 0,
      fontSize: 16,
      marginBottom: 10,
    },
  });
};

export default dynamicStyles;
