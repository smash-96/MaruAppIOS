import { firebase } from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/firestore";
//import '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCa7xkSqaL8GjdpMkbPbPO4JMSE_OotKBE",
  authDomain: "volunteerteam-1c46b.firebaseapp.com",
  databaseURL: "https://volunteerteam-1c46b.firebaseio.com",
  projectId: "volunteerteam-1c46b",
  storageBucket: "volunteerteam-1c46b.appspot.com",
  databaseURL: "https://volunteerteam-1c46b.firebaseio.com",
  messagingSenderId: "804750691319",
  appId: "1:804750691319:android:a4d2c4dabcc764b871bcf2",
  //measurementId: 'G-SD63B5VD6J',
};

let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const auth = app.auth();
const db = app.firestore();

export { auth, db };
