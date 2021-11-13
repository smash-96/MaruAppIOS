import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const { height } = Dimensions.get("window");
const imageSize = height * 0.14;
const photoIconSize = imageSize * 0.27;

const dynamicStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignContent: "center",
      backgroundColor: "white",
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 20,
      alignSelf: "stretch",
      textAlign: "left",
      marginLeft: 30,
      color: "#ea60d6",
    },
    inputContainer: {
      height: 42,
      borderWidth: 1,
      borderColor: "grey",
      paddingLeft: 20,
      width: "80%",
      alignSelf: "center",
      marginTop: 10,
      alignItems: "center",
      borderRadius: 25,
    },
    buttonContainer: {
      width: "70%",
      borderRadius: 25,
      padding: 10,
      marginTop: 30,
      alignSelf: "center",
      backgroundColor: "#ea60d6",
    },
    error: {
      color: "crimson",
      fontWeight: "bold",
      fontSize: 15,
      //marginBottom: 10,
      //marginTop: 6,
      textAlign: "center",
    },
    // ortext: {
    //   marginTop: 40,
    //   marginBottom: 10,
    //   alignSelf: 'center',
    // },
    eyeContainer: {
      flex: 1,
    },
    //image upload icons
    image: {
      width: "100%",
      height: "100%",
    },
    imageBlock: {
      flex: 2,
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    imageContainer: {
      height: imageSize,
      width: imageSize,
      borderRadius: imageSize,
      shadowColor: "#006",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      overflow: "hidden",
    },

    addButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#d6d6d6",
      opacity: 0.8,
      zIndex: 2,
      marginTop: imageSize * 0.77,
      marginLeft: -imageSize * 0.29,
      width: photoIconSize,
      height: photoIconSize,
      borderRadius: photoIconSize,
    },
    // bottom sheet
    panel: {
      padding: 20,
      backgroundColor: "#FFFFFF",
      paddingTop: 20,
      // borderTopLeftRadius: 20,
      // borderTopRightRadius: 20,
      // shadowColor: '#000000',
      // shadowOffset: {width: 0, height: 0},
      // shadowRadius: 5,
      // shadowOpacity: 0.4,
    },
    header: {
      backgroundColor: "#FFFFFF",
      shadowColor: "#333333",
      shadowOffset: { width: -1, height: -3 },
      shadowRadius: 2,
      shadowOpacity: 0.4,
      // elevation: 5,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    panelHeader: {
      alignItems: "center",
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#00000040",
      marginBottom: 10,
    },
    panelTitle: {
      fontSize: 27,
      height: 35,
    },
    panelSubtitle: {
      fontSize: 14,
      color: "gray",
      height: 30,
      marginBottom: 10,
    },
    panelButton: {
      padding: 13,
      borderRadius: 10,
      backgroundColor: "#ea60d6",
      alignItems: "center",
      marginVertical: 7,
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: "bold",
      color: "white",
    },
  });
};

export default dynamicStyles;
