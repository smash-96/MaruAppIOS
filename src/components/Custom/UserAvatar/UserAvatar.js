import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import dynamicStyles from "./styles";
//import { Avatar, Button } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import ActionSheet from "@alessiocancian/react-native-actionsheet";

import ImagePicker from "react-native-image-crop-picker";
import ImageView from "react-native-image-viewing";
import FastImage from "react-native-fast-image";

const Image = FastImage;

const UserAvatar = (props) => {
  const styles = dynamicStyles();
  const baseAvatar =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const [image, setImage] = useState(props.profilePic || baseAvatar || "");

  const originalProfilePictureURL = useRef(props.profilePic || "");
  if (originalProfilePictureURL.current !== (props.profilePic || "")) {
    originalProfilePictureURL.current = props.profilePic || "";
    setImage(props.profilePic || baseAvatar || "");
  }

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [tappedImage, setTappedImage] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const actionSheet = useRef(null);

  const handleProfilePictureClick = () => {
    if (image === baseAvatar && !props.drawer) {
      console.log("Image Selector Opened");
      showActionSheet();
    } else if (image !== baseAvatar) {
      const imageView = [
        {
          uri: image,
        },
      ];
      setTappedImage(imageView);
      setIsImageViewerVisible(true);
    }
  };

  const onImageError = () => {
    console.log("Error loading profile photo at url " + image);
    setImage(baseAvatar);
  };

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      compressImageMaxWidth: 300,
      compressImageMaxHeight: 300,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then((image) => {
        console.log("PICTURE OBTAINED", image)
        setImage(Platform.OS === "ios" ? image.path : image.path);
        props.setProfilePicture(
          Platform.OS === "ios" ? image.path : image.path
        ); // calling the function from parent to set state in parent
      })
      .catch((error) => console.log("PICTURE ERROR", error));
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then((image) => {
        console.log("PICTURE OBTAINED", image)
        setImage(Platform.OS === "ios" ? image.path : image.path);
        props.setProfilePicture(
          Platform.OS === "ios" ? image.path : image.path
        );
      })
      .catch((error) => console.log("PICTURE ERROR", error));
  };

  const closeButton = () => (
    <TouchableOpacity
      style={styles.closeButton}
      onPress={() => setIsImageViewerVisible(false)}
    >
      <Image style={styles.closeIcon} source={appStyles.iconSet.close} />
    </TouchableOpacity>
  );

  const showActionSheet = (index) => {
    setSelectedPhotoIndex(index); // saving the option that user chooses
    actionSheet.current.show();
  };

  const onActionDone = (index) => {
    if (index == 0) {
      takePhotoFromCamera();
      props.parentFunc("avatar");
      //onPressAddPhotoBtn();
    } else if (index == 1) {
      choosePhotoFromLibrary();
      props.parentFunc("avatar");
    }
    // if (index == 3) {
    //   // Remove button
    //   // if (profilePictureURL) {
    //   //   setProfilePictureURL(null);
    //   //   props.setProfilePicture(null);
    //   // }
    //   setImage(baseAvatar);
    //   props.setProfilePicture(baseAvatar);

    //   props.parentFunc("avatar");
    // }
  };

  return (
    <>
      <View style={styles.imageBlock}>
        <TouchableHighlight
          style={styles.imageContainer}
          onPress={handleProfilePictureClick}
        >
          <Image
            style={[styles.image, { opacity: image !== baseAvatar ? 1 : 0.3 }]}
            source={{ uri: image }}
            resizeMode="cover"
            onError={onImageError}
          />
          {/* <Image
            style={[styles.image, { opacity: profilePictureURL ? 1 : 0.3 }]}
            source={
              profilePictureURL
                ? { uri: profilePictureURL }
                : appStyles.iconSet.userAvatar
            }
            resizeMode="cover"
            onError={onImageError}
          /> */}
        </TouchableHighlight>

        {props.drawer ? (
          <View></View>
        ) : (
          <TouchableOpacity onPress={showActionSheet} style={styles.addButton}>
            <Icon name="camera" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <ActionSheet
        ref={actionSheet}
        title="Confirm action"
        options={[
          "Open Camera",
          "Upload Photo",
          "Cancel",
          //"Remove Profile Photo",
        ]}
        cancelButtonIndex={2}
        //destructiveButtonIndex={3}
        onPress={(index) => {
          onActionDone(index);
        }}
      />
      {/* <ScrollView showsVerticalScrollIndicator={false}>

      </ScrollView> */}
      {/* <ImageView
          images={tappedImage}
          isVisible={isImageViewerVisible}
          onClose={() => setIsImageViewerVisible(false)}
          controls={{ close: closeButton }}
        /> */}

      <ImageView
        images={tappedImage}
        imageIndex={0}
        visible={isImageViewerVisible}
        onRequestClose={() => setIsImageViewerVisible(false)}
      />
    </>
    // <View style={{ backgroundColor: "#effdfe" }}>
    //   {/* <BottomSheet
    //     ref={bs}
    //     snapPoints={[330, 0]}
    //     renderContent={renderInner}
    //     renderHeader={renderHeader}
    //     initialSnap={1}
    //     callbackNode={fall}
    //     enabledGestureInteraction={true}
    //   /> */}
    //   <Animated.View
    //     style={{
    //       margin: 20,
    //       opacity: Animated.add(0.1, Animated.multiply(fall, 1.0)),
    //     }}
    //   ></Animated.View>

    //   <View style={styles.imageBlock}>
    //     <TouchableHighlight
    //       style={styles.imageContainer}
    //       onPress={() => handleProfilePictureClick(bs)}
    //     >
    //       <Image
    //         style={[styles.image, { opacity: image !== baseAvatar ? 1 : 0.3 }]}
    //         source={{ uri: image }}
    //         resizeMode="cover"
    //         onError={onImageError}
    //       />
    //     </TouchableHighlight>

    //     <TouchableOpacity
    //       onPress={() => bs.current.snapTo(0)}
    //       style={styles.addButton}
    //     >
    //       <Avatar
    //         rounded
    //         size={30}
    //         color="white"
    //         source={{
    //           uri: "https://cdn3.vectorstock.com/i/1000x1000/97/37/photo-camera-icon-vector-21679737.jpg",
    //         }}
    //       />
    //       {/* <Icon name="camera" size={20} color="white" /> */}
    //     </TouchableOpacity>
    //   </View>

    //   <ImageView
    //     images={tappedImage}
    //     imageIndex={0}
    //     visible={isImageViewerVisible}
    //     onRequestClose={() => setIsImageViewerVisible(false)}
    //   />
    // </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({});
