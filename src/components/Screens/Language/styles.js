import { StyleSheet } from "react-native";

const dynamic_styles = () => {
  return StyleSheet.create({
    lang_image: {
      flex: 1,
      resizeMode: "cover",
      justifyContent: "center",
    },
  });
};

export default dynamic_styles;
