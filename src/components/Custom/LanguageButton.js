import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const LanguageButton = ({ title, handlePress }) => {
  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.v}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  v: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "black",
    width: "70%",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 16,
    textAlign: "center",
  },
});

export default LanguageButton;
