import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const AuthenticationButton = props => {
  return (
    <TouchableOpacity onPress={props.handlePress}>
      <View
        style={[
          styles.button,
          {
            backgroundColor: props.backGroundColor,
            borderColor: props.borderColor,
          },
        ]}>
        <Text style={[styles.buttonText, {color: props.textColor}]}>
          {props.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
export default AuthenticationButton;
