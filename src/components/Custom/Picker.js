import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
// NEW
const Picker = (props) => {
  // useEffect(() => {}, selected_data);
  const actionSheet = useRef();
  
  console.log("11 22 33 44 55s")
  const parent_value = props.myValue.length;
  const [selected_data, set_selected_data] = useState("");
  const setValue = (index, picker_type) => {
    console.log("11 22 33 44 55s 3333")
    if (picker_type === "gender") {
      console.log("GENDER HERE!");
      if (index === 0) {
        set_selected_data("Male");
      } else {
        set_selected_data("Female");
      }
    } else {
      if (index === 0) {
        set_selected_data("helper");
        props.parentFunc("userType");
      } else {
        set_selected_data("helpee");
        props.parentFunc("userType");
      }
    }
  };
  const showActionSheet = ()=>{

    if (actionSheet?.current)
    actionSheet?.current?.show();
  }

  return (
    <View>
      <Text onPress={showActionSheet} style={styles.fields}>
        {parent_value > 0 && (
          <Text style={{ color: "black" }}>{props.myValue}</Text>
        )}
        {parent_value <= 0 && (
          <>
            <Text style={{ color: "black" }}>{selected_data}</Text>
            <Text> {props.myplaceholder}</Text>
          </>
        )}
      </Text>

      <ActionSheet
        ref={actionSheet}
        title={props.title}
        options={props.options}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={(index) => {
          setValue(index, props.title);
          props.getValues(index, props.title);
        }}
      />
    </View>
  );
};

export default Picker;

const styles = StyleSheet.create({
  fields: {
    fontSize: 18,
    margin: 10,
    color: "gray",
  },
});
