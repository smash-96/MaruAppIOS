import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Modal } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const Network = () => {
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      if (state.isConnected) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });

    return unsubscribe;
  }, []);

  if (connected) {
    return null;
  }
  return (
    <Modal
      visible={true}
      animationType={"fade"}
      presentationStyle={"fullScreen"}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>
          Internet not available. Connect to an available network to use the
          app.
        </Text>
      </View>
    </Modal>
  );
};

export default Network;

const styles = StyleSheet.create({});
