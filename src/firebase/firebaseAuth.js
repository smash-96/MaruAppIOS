//import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
//import { ErrorCode } from '../../onboarding/utils/ErrorCode';
import { auth, db } from "./firebaseConfig";
import { firebase as RNFBAuth } from "@react-native-firebase/auth";
import VoipPushNotification from 'react-native-voip-push-notification';
//import { GoogleSignin } from '@react-native-google-signin/google-signin';
const usersRef = db.collection("Users");

const handleUserFromAuthStateChanged = (user, resolve) => {
  if (user) {
    usersRef
      .doc(user.uid)
      .get()
      .then((document) => {
        const userData = document.data();
        const emailVerified = user.emailVerified;
        resolve({ ...userData, id: user.uid, userID: user.uid, emailVerified });
      })
      .catch((error) => {
        resolve(null);
      });
  } else {
    resolve(null);
  }
};

export const tryAlternatePersistedAuthUserRetriever = (resolve) => {
  RNFBAuth.auth().onAuthStateChanged((user) => {
    if (user) {
      return handleUserFromAuthStateChanged(user, resolve);
    } else {
      resolve(null);
    }
  });
};

export const retrievePersistedAuthUser = () => {
  return new Promise((resolve) => {
    return auth.onAuthStateChanged((user) => {
      //console.log("LOGIN USER", user);
      if (user) {
        return handleUserFromAuthStateChanged(user, resolve);
      } else {
        return tryAlternatePersistedAuthUserRetriever(resolve);
      }
    });
  });
};

// export const sendPasswordResetEmail = (email) => {
//   auth.sendPasswordResetEmail(email);
// };

const signInWithCredential = (authManager, credential, appIdentifier) => {
  return new Promise((resolve, _reject) => {
    authManager
      .auth()
      .signInWithCredential(credential)
      .then((response) => {
        console.log("RESPONSE", response);
        const isNewUser = response.additionalUserInfo.isNewUser;
        const { first_name, last_name, family_name, given_name } =
          response.additionalUserInfo.profile;
        const { uid, email, phoneNumber, photoURL } = response.user;
        const defaultProfilePhotoURL =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

        if (isNewUser) {
          //const timestamp = firebase.firestore.FieldValue.serverTimestamp();
          const userData = {
            id: uid,
            email: email || "",
            firstName: first_name || given_name || "",
            lastName: last_name || family_name || "",
            phone: phoneNumber || "",
            profilePictureURL: photoURL || defaultProfilePhotoURL,
            userID: uid,
            appIdentifier,
            //createdAt: timestamp,
          };
          usersRef
            .doc(uid)
            .set(userData)
            .then(() => {
              resolve({
                user: { ...userData, id: uid, userID: uid },
                accountCreated: true,
              });
            });
        }
        usersRef
          .doc(uid)
          .get()
          .then((document) => {
            const userData = document.data();
            resolve({
              user: { ...userData, id: uid, userID: uid },
              accountCreated: false,
            });
          });
      })
      .catch((_error) => {
        console.log(_error);
        resolve({ error: "ErrorCode.serverError" });
      });
  });
};

// export const checkUniqueUsername = (username) => {
//   return new Promise((resolve) => {
//     usersRef
//       .where("username", "==", username)
//       .get()
//       .then((querySnapshot) => {
//         if (querySnapshot.docs.length <= 0) {
//           // doesn't exist
//           resolve({ isUnique: true });
//         } else {
//           // does exist
//           resolve({ taken: true });
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };

// export const register = (userDetails, appIdentifier) => {
//   const {
//     email,
//     firstName,
//     lastName,
//     username,
//     password,
//     phone,
//     profilePictureURL,
//     location,
//     signUpLocation,
//   } = userDetails;
//   return new Promise(function (resolve, _reject) {
//     firebase
//       .auth()
//       .createUserWithEmailAndPassword(email, password)
//       .then((response) => {
//         const timestamp = firebase.firestore.FieldValue.serverTimestamp();
//         const uid = response.user.uid;

//         const data = {
//           id: uid,
//           userID: uid, // legacy reasons
//           email,
//           firstName: firstName || "",
//           lastName: lastName || "",
//           username: username || "",
//           phone: phone || "",
//           profilePictureURL,
//           location: location || "",
//           signUpLocation: signUpLocation || "",
//           appIdentifier,
//           createdAt: timestamp,
//         };
//         usersRef
//           .doc(uid)
//           .set(data)
//           .then(() => {
//             resolve({ user: data });
//           })
//           .catch((error) => {
//             alert(error);
//             resolve({ error: ErrorCode.serverError });
//           });
//       })
//       .catch((error) => {
//         console.log("_error:", error);
//         var errorCode = ErrorCode.serverError;
//         if (error.code === "auth/email-already-in-use") {
//           errorCode = ErrorCode.emailInUse;
//         }
//         resolve({ error: errorCode });
//       });
//   });
// };

export const loginWithEmailAndPassword = async (email, password) => {
  return new Promise(function (resolve, reject) {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        const uid = response.user.uid;
        const emailVerified = response.user.emailVerified;

        const userData = {
          email,
          password,
          id: uid,
          emailVerified,
        };
        usersRef
          .doc(uid)
          .get()
          .then(function (firestoreDocument) {
            if (!firestoreDocument.exists) {
              resolve({ errorCode: "No User Error" });
              return;
            }
            const user = firestoreDocument.data();
            const newUserData = {
              ...userData,
              ...user,
            };
            resolve({ user: newUserData });
          })
          .catch(function (_error) {
            console.log("_error:", _error);
            resolve({ error: "Server Error" });
          });
      })
      .catch((error) => {
        console.log("error:", error);
        // var errorCode = ErrorCode.serverError;
        // switch (error.code) {
        //   case "auth/wrong-password":
        //     errorCode = ErrorCode.invalidPassword;
        //     break;
        //   case "auth/network-request-failed":
        //     errorCode = ErrorCode.serverError;
        //     break;
        //   case "auth/user-not-found":
        //     errorCode = ErrorCode.noUser;
        //     break;
        //   default:
        //     errorCode = ErrorCode.serverError;
        // }
        resolve({ error: "Some Error Occured!" });
      });
  });
};

// export const loginWithApple = (identityToken, nonce, appIdentifier) => {
//   const appleCredential = RNFBAuth.auth.AppleAuthProvider.credential(
//     identityToken,
//     nonce
//   );

//   return new Promise((resolve, _reject) => {
//     signInWithCredential(RNFBAuth, appleCredential, appIdentifier).then(
//       (response) => {
//         resolve(response);
//       }
//     );
//   });
// };

// export const loginWithFacebook = (accessToken, appIdentifier) => {
//   const credential = firebase.auth.FacebookAuthProvider.credential(accessToken);

//   return new Promise((resolve, _reject) => {
//     signInWithCredential(firebase, credential, appIdentifier).then(
//       (response) => {
//         resolve(response);
//       }
//     );
//   });
// };

export const loginWithGoogle = (idToken, appIdentifier) => {
  const credential = RNFBAuth.auth.GoogleAuthProvider.credential(idToken);

  return new Promise((resolve, _reject) => {
    signInWithCredential(RNFBAuth, credential, appIdentifier).then(
      (response) => {
        resolve(response);
      }
    );
  });
};

// export const logout = () => {
//   firebase.auth().signOut();
//   RNFBAuth.auth().signOut();
// };

// export const onVerificationChanged = (phone) => {
//   auth()
//     .verifyPhoneNumber(phone)
//     .on(
//       "state_changed",
//       (phoneAuthSnapshot) => {
//         console.log("State: ", phoneAuthSnapshot.state);
//       },
//       (error) => {
//         console.error(error);
//       },
//       (phoneAuthSnapshot) => {
//         console.log(phoneAuthSnapshot);
//       }
//     );
// };

// export const retrieveUserByPhone = (phone) => {
//   return new Promise((resolve) => {
//     usersRef.where("phone", "==", phone).onSnapshot((querySnapshot) => {
//       if (querySnapshot.docs.length <= 0) {
//         resolve({ error: true });
//       } else {
//         resolve({ success: true });
//       }
//     });
//   });
// };

// export const sendSMSToPhoneNumber = (phoneNumber, captchaVerifier) => {
//   return new Promise(function (resolve, _reject) {
//     firebase
//       .auth()
//       .signInWithPhoneNumber(phoneNumber, captchaVerifier)
//       .then(function (confirmationResult) {
//         // SMS sent. Prompt user to type the code from the message, then sign the
//         // user in with confirmationResult.confirm(code).
//         resolve({ confirmationResult });
//       })
//       .catch(function (_error) {
//         console.log(_error);
//         console.warn(_error);
//         resolve({ error: ErrorCode.smsNotSent });
//       });
//   });
// };

// export const loginWithSMSCode = (smsCode, verificationID) => {
//   const credential = firebase.auth.PhoneAuthProvider.credential(
//     verificationID,
//     smsCode
//   );
//   return new Promise(function (resolve, _reject) {
//     firebase
//       .auth()
//       .signInWithCredential(credential)
//       .then((result) => {
//         const { user } = result;
//         usersRef
//           .doc(user.uid)
//           .get()
//           .then(function (firestoreDocument) {
//             if (!firestoreDocument.exists) {
//               resolve({ errorCode: ErrorCode.noUser });
//               return;
//             }
//             const userData = firestoreDocument.data();
//             resolve({ user: userData });
//           })
//           .catch(function (_error) {
//             resolve({ error: ErrorCode.serverError });
//           });
//       })
//       .catch((_error) => {
//         resolve({ error: ErrorCode.invalidSMSCode });
//       });
//   });
// };

// export const registerWithPhoneNumber = (
//   userDetails,
//   smsCode,
//   verificationID,
//   appIdentifier
// ) => {
//   const {
//     firstName,
//     lastName,
//     username,
//     phone,
//     profilePictureURL,
//     location,
//     signUpLocation,
//   } = userDetails;
//   const credential = firebase.auth.PhoneAuthProvider.credential(
//     verificationID,
//     smsCode
//   );
//   return new Promise(function (resolve, _reject) {
//     firebase
//       .auth()
//       .signInWithCredential(credential)
//       .then((response) => {
//         const timestamp = firebase.firestore.FieldValue.serverTimestamp();
//         const uid = response.user.uid;
//         const data = {
//           id: uid,
//           userID: uid, // legacy reasons
//           firstName: firstName || "",
//           lastName: lastName || "",
//           username: username || "",
//           phone,
//           profilePictureURL,
//           location: location || "",
//           signUpLocation: signUpLocation || "",
//           appIdentifier,
//           createdAt: timestamp,
//         };
//         usersRef
//           .doc(uid)
//           .set(data)
//           .then(() => {
//             resolve({ user: data });
//           });
//       })
//       .catch((error) => {
//         console.log(error);
//         var errorCode = ErrorCode.serverError;
//         if (error.code === "auth/email-already-in-use") {
//           errorCode = ErrorCode.emailInUse;
//         }
//         resolve({ error: errorCode });
//       });
//   });
// };

export const updateProfilePhoto = (userID, profilePictureURL) => {
  return new Promise((resolve, _reject) => {
    usersRef
      .doc(userID)
      .update({ profilePictureURL: profilePictureURL })
      .then(() => {
        resolve({ success: true });
      })
      .catch((error) => {
        resolve({ error: error });
      });
  });
};

// export const fetchHelpRequestData = async (user) => {
//   //console.log("fetchHelpRequestData", user);

//   const requestID = (await usersRef.doc(user.uid).get()).data().helpRequestID;
//   console.log("requestID", requestID);
//   if (requestID !== null) {
//     const requestData = (
//       await db.collection("requests").doc(requestID).get()
//     ).data();
//     console.log("requestData", requestData);
//     return requestData;
//   }
//   return requestID;
// };

export const fetchAndStorePushTokenIfPossible = async (user) => {
  try {
    const settings = await messaging().requestPermission();
    if (settings) {
      const token = await messaging().getToken();
      updateUser(user.uid || user.userID, {
        pushToken: token,
        pushKitToken: "",
        badgeCount: 0,
      });
    }

    if (Platform.OS === "ios") {
      VoipPushNotification.requestPermissions();
      VoipPushNotification.registerVoipToken();

      VoipPushNotification.addEventListener("register", (token) => {
        console.log("push kit token from ios", token);

        updateUser(user.uid || user.userID, { pushKitToken: token });
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (userID, newData) => {
  const dataWithOnlineStatus = {
    ...newData,
    //lastOnlineTimestamp: firestore.FieldValue.serverTimestamp(), // Turn on when implementing "last seen & typing indicators" etc
  };
  return await usersRef
    .doc(userID)
    .set({ ...dataWithOnlineStatus }, { merge: true });
};

export const getUserByID = async (userID) => {
  try {
    const document = await usersRef.doc(userID).get();
    if (document) {
      return document.data();
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const authAPI = {
  loginWithEmailAndPassword,
  retrievePersistedAuthUser,
  //fetchHelpRequestData,
  fetchAndStorePushTokenIfPossible,
  getUserByID,
  updateProfilePhoto,
  updateUser,
  loginWithGoogle,
};

export default authAPI;
