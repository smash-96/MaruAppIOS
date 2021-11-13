import React from "react";
import { ImageBackground } from "react-native";
import deviceStorage from "../../Utils/AuthDeviceStorage";
import LanguageButton from "../../Custom/LanguageButton";

import { setLocale } from "../../../localization/utils/language";

import dynamic_styles from "./styles";

const SelectLanguage = (props) => {
  const styles = dynamic_styles();

  return (
    <ImageBackground
      source={require("../../../assets/bgLanguage.png")}
      style={styles.lang_image}
    >
      <LanguageButton
        title={"English"}
        handlePress={() => {
          console.log("English");
          setLocale("en");
          deviceStorage.setShouldShowOnboardingFlow("false");
          deviceStorage.setAppLanguage("en");
          props.navigation.replace("Login");
        }}
      />

      <LanguageButton
        title={"日本語"}
        handlePress={() => {
          console.log("Japanese");
          setLocale("jp");
          deviceStorage.setShouldShowOnboardingFlow("false");
          deviceStorage.setAppLanguage("jp");
          props.navigation.replace("Login");
        }}
      />
    </ImageBackground>
  );
};

export default SelectLanguage;
