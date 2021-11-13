import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Avatar, Button} from 'react-native-elements';
import UserAvatar from '../../Custom/UserAvatar/UserAvatar';
import deviceStorage from '../../Utils/AuthDeviceStorage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {auth, db} from '../../../firebase/firebaseConfig';
//import firestore from "@react-native-firebase/firestore";
import storage from '@react-native-firebase/storage';
import dynamic_styles from './styles';
import I18n from '../../../localization/utils/language';
import {useDispatch, useSelector} from 'react-redux';
import {
  setUserType,
  setUserPhoto,
  setUserFname,
  setUserLname,
  setUserAddress,
  setUserGender,
  setUserAge,
  setFirstSignup,
} from '../../../slices/userInfoSlice';
import {
  selectUserPhoto,
  selectUserType,
  selectUserFname,
  selectUserLname,
  selectUserAddress,
  selectUserGender,
  selectUserAge,
  selectFirstSignup,
} from '../../../slices/userInfoSlice';
import {selectActiveRequestData} from '../../../slices/helpRequestSlice';
import {useNavigation} from '@react-navigation/native';
import Picker from '../../Custom/Picker';
import {Icon} from 'react-native-elements';

const ProfileScreen = props => {
  const navigation = useNavigation();
  const styles = dynamic_styles();
  const dispatch = useDispatch();
  const userPhoto = useSelector(selectUserPhoto);
  const userType = useSelector(selectUserType);
  const userFname = useSelector(selectUserFname);
  const userLname = useSelector(selectUserLname);
  const userAddress = useSelector(selectUserAddress);
  const userGender = useSelector(selectUserGender);
  const userAge = useSelector(selectUserAge);
  const activeRequestData = useSelector(selectActiveRequestData);
  const firstSignup = useSelector(selectFirstSignup);

  const baseAvatar =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  const [image, setImage] = useState(baseAvatar || '');
  const [profilePic, setProfilePic] = useState(baseAvatar || '');
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [profileLock, setProfileLock] = useState(true);

  const [fname, setFname] = useState(null);
  const [lname, setLname] = useState(null);
  const [address, setAddress] = useState(null);
  const [age, setAge] = useState(null);
  const [btnDisable, setBtnDisable] = useState(false);
  const options_gender = [
    <Text style={styles.action_sheet}>{I18n.t('profile.sheet1.male')}</Text>,
    <Text style={styles.action_sheet}>{I18n.t('profile.sheet1.female')}</Text>,
    <Text style={{fontWeight: 'bold'}}>{I18n.t('profile.cancel')}</Text>,
  ];
  const options_type = [
    <Text style={styles.action_sheet}>{I18n.t('profile.sheet2.helper')}</Text>,
    <Text style={styles.action_sheet}>{I18n.t('profile.sheet2.helpee')}</Text>,
    <Text style={{fontWeight: 'bold'}}>{I18n.t('profile.cancel')}</Text>,
  ];
  const [gender_placeHolder, set_gender_placeHolder] = useState([
    'Select your gender',
  ]);
  const [type_placeHolder, set_type_placeHolder] = useState([
    'Select your type',
  ]);

  const [gender, setGender] = useState('');
  const [uType, setUType] = useState('');

  const getPickerValues = (index, picker_type) => {
    if (picker_type == 'Gender') {
      if (index == 0) {
        setGender('Male');
      } else {
        setGender('Female');
      }
      set_gender_placeHolder(null);
    } else {
      if (index == 0) {
        setUType('helper');
      } else {
        setUType('helpee');
      }
      set_type_placeHolder(null);
    }
  };

  function checkProfileComplete() {
    if (
      userPhoto !== null &&
      userPhoto != baseAvatar &&
      userFname !== null &&
      userFname !== '' &&
      userLname !== null &&
      userLname !== '' &&
      userAddress !== null &&
      userAddress !== '' &&
      userGender !== null &&
      userGender !== '' &&
      userAge !== null &&
      userAge !== '' &&
      userType !== null &&
      userType !== ''
    ) {
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (checkProfileComplete() === true) {
      setProfileLock(false);
    }
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: I18n.t('profile.header'),
      headerStyle: {backgroundColor: '#2c88d1'},
      headerTitleStyle: {color: 'white'},
      headerLeft: () => (
        <View style={{marginLeft: 20}}>
          {profileLock === false ? (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              activeOpacity={0.5}>
              <Icon name="menu" size={34} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  I18n.t('profile.alert2.header'),
                  I18n.t('profile.alert2.text'),
                );
              }}
              activeOpacity={0.5}>
              <Icon name="menu" color="red" size={34} />
            </TouchableOpacity>
          )}

          {/* <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={tw`bg-gray-100 absolute top-16 left-8 z-50 p-3 rounded-full shadow-lg`}
          >
            <Icon name="menu" />
          </TouchableOpacity> */}
        </View>
      ),
      headerRight: () => (
        <View style={{marginRight: 20}}>
          <TouchableOpacity>
            <Avatar
              rounded
              source={require('../../../assets/MessageLogo.png')}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, profileLock]);

  useEffect(() => {
    if (userPhoto !== null) {
      setProfilePic(userPhoto);
    }

    if (checkProfileComplete() === true) {
      setBtnDisable(true);
      // if (!firstSignup) {
      //   Alert.alert(
      //     "Profile Completed",
      //     "Your profile is now complete. You can navigate through it by pressing the menu icon on top left."
      //   );
      // }
    }
  }, [userPhoto, profilePic]);

  const setProfilePicture = img => {
    setImage(img);
  };

  useEffect(() => {
    setFname(userFname);
    setLname(userLname);
    setAddress(userAddress);
    setGender(userGender);
    setAge(userAge);
    setUType(userType);

    if (checkProfileComplete() === true) {
      setBtnDisable(true);
      console.log('firstSignup', firstSignup);
      if (firstSignup !== 'true') {
        Alert.alert(
          'Profile Completed',
          'Your profile is now complete. You can navigate through it by pressing the menu icon on top left.',
        );
      }
    }
  }, [userAddress, userGender, userAge, userType]);

  const uploadImage = async () => {
    if (image != baseAvatar) {
      const pathToFile = image;
      console.log('pathToFile', pathToFile);
      let filename = pathToFile.substring(pathToFile.lastIndexOf('/') + 1);

      // Add timestamp to File Name
      const extension = filename.split('.').pop();
      const name = filename.split('.').slice(0, -1).join('.');
      filename = name + Date.now() + '.' + extension;

      //setUploading(true);
      setTransferred(0);

      const reference = storage().ref(filename);
      const task = reference.putFile(pathToFile);

      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );

        setTransferred(
          Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
            100,
        );
      });

      try {
        await task;
        const url = await reference.getDownloadURL();

        //setUploading(false);
        setImage(baseAvatar);

        // Alert.alert(
        //   'Image uploaded!',
        //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
        // );
        return url;
      } catch (error) {
        console.log(error);
        return null;
      }
    } else {
      Alert.alert(
        'No Image Selected!',
        'Your profile cannot be created without an image!',
      );
      return null;
    }
  };

  const submit = async () => {
    if (!activeRequestData) {
      setUploading(true);
      const cRef = db.collection('Users').doc(auth?.currentUser?.uid);
      cRef.update({
        fname: fname,
        lname: lname,
        Address: address,
        Gender: gender,
        Age: age,
        userType: uType,
      });

      // dispatch(setUserFname(fname));
      // dispatch(setUserLname(lname));
      dispatch(setUserAddress(address));
      dispatch(setUserGender(gender));
      dispatch(setUserAge(age));
      dispatch(setUserType(uType));

      let photoUrl;
      if (image !== baseAvatar) {
        photoUrl = await uploadImage();
        if (photoUrl != null) {
          cRef.update({
            photoUrl: photoUrl,
          });
          dispatch(setUserPhoto(photoUrl));

          auth.currentUser.updateProfile({photoURL: photoUrl});
        }
      }
      // else {
      //   cRef.update({
      //     photoUrl: null,
      //   });
      //   dispatch(setUserPhoto(null));

      //   auth.currentUser.updateProfile({ photoURL: null });
      // }

      deviceStorage.setFirstSignup('true');
      dispatch(setFirstSignup('true'));

      // if (checkProfileComplete() === true) {
      //   setBtnDisable(true);
      // }
      // if (checkProfileComplete() === true) {
      //   console.log("PROFILE COMPLETE");
      //   setBtnDisable(true);
      //   //setProfileLock(false);
      //   deviceStorage.setFirstSignup("true");
      //   console.log(
      //     "await deviceStorage.getFirstSignup()",
      //     await deviceStorage.getFirstSignup()
      //   );
      // } else {
      //   console.log("PROFILE INCOMPLETE");
      //   setBtnDisable(false);
      //   //setProfileLock(true);
      // }

      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploading(false);

      if (firstSignup === 'true') {
        Alert.alert(
          I18n.t('profile.alert1.header'),
          I18n.t('profile.alert1.text'),
        );
      }
    } else {
      Alert.alert(
        I18n.t('profile.alert3.header'),
        I18n.t('profile.alert3.text'),
      );
    }
  };

  const setDisableBtnFromPickerChild = child => {
    if (checkProfileComplete() === true) {
      // comparing equal because state is getting set after this function is execcuted
      if (child === 'userType') {
        if (userType === uType) {
          setBtnDisable(false);
        } else {
          setBtnDisable(true);
        }
      } else if (child === 'avatar') {
        if (userPhoto !== image) {
          setBtnDisable(false);
        } else {
          setBtnDisable(true);
        }
      }
    }
  };

  //
  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      keyboardShouldPersistTaps={'handled'}
      enableResetScrollToCoords={false}
      style={{paddingTop: '10%', backgroundColor: '#effdfe'}}>
      <View>
        {/* PROFILE PICTURE */}
        <UserAvatar
          setProfilePicture={setProfilePicture}
          profilePic={profilePic}
          parentFunc={setDisableBtnFromPickerChild}
        />
        <View>
          {/* First Name */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.fname')}</Text>
            <Text style={styles.fields}>{fname}</Text>

            {/* <TextInput
              style={styles.fields}
              onChangeText={(val) => setFname(val)}
              value={fname}
              //defaultValue={userFname}
              placeholder="John"
            /> */}
          </View>

          {/* Last Name */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.lname')}</Text>
            <Text style={styles.fields}>{lname}</Text>

            {/* <TextInput
              style={styles.fields}
              onChangeText={(val) => setLname(val)}
              value={lname}
              //defaultValue={userLname}
              placeholder="Doe"
            /> */}
          </View>
          {/* 
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>Email</Text>

            <TextInput
              style={styles.fields}
              onChangeText={(val) => setEmail(val)}
              value={email}
              defaultValue={userEmail}
              placeholder="me@gmail.com"
            />
          </View> */}

          {/* Address  */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.address')}</Text>
            {userAddress !== null ? (
              <Text style={styles.fields}>{address}</Text>
            ) : (
              <TextInput
                style={styles.fields}
                onChangeText={val => {
                  setAddress(val);
                }}
                value={address}
                //defaultValue={userAddress}
                placeholder="Address"
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.gender')}</Text>
            {userGender !== '' ? (
              <Text style={styles.fields}>{gender}</Text>
            ) : (
              <Picker
                myValue={gender}
                getValues={getPickerValues}
                options={options_gender}
                title={I18n.t('profile.gender')}
                myplaceholder={gender_placeHolder}
                parentFunc={setDisableBtnFromPickerChild}
              />
            )}
          </View>

          {/* Age */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.age')}</Text>

            {userAge !== null ? (
              <Text style={styles.fields}>{age}</Text>
            ) : (
              <TextInput
                style={styles.dob}
                onChangeText={val => {
                  setAge(val);
                }}
                value={age}
                placeholder="Your Age"
                keyboardType="numeric"
              />
            )}

            {/* <TextInput
              style={styles.dob}
              onChangeText={(val) => {
                setAge(val);
              }}
              value={age}
              placeholder="Your Age"
              keyboardType="numeric"
            /> */}
          </View>

          {/* User Type */}
          <View style={styles.singleRow}>
            <Text style={styles.left_fields}>{I18n.t('profile.type')}</Text>
            <Picker
              myValue={uType}
              getValues={getPickerValues}
              options={options_type}
              title={I18n.t('profile.type')}
              myplaceholder={type_placeHolder}
              parentFunc={setDisableBtnFromPickerChild}
            />
          </View>
        </View>
        <View style={styles.submit}>
          {uploading === true ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {/* <Text>{transferred} % Completed</Text> */}
              <Text>{I18n.t('profile.indicatorText')}</Text>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Button
                disabled={btnDisable}
                containerStyle={{
                  margin: '10%',

                  // borderRadius: 120,
                  // borderRadius: 70,
                  width: '30%',
                }}
                title={I18n.t('profile.button')}
                onPress={submit}
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileScreen;
