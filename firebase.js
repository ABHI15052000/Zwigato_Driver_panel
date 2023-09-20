// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { initializeFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAV6TIGaLM3m85pmmxx7QJ7awv-ZKA9HBI",
//   authDomain: "zwigato-9b391.firebaseapp.com",
//   projectId: "zwigato-9b391",
//   storageBucket: "zwigato-9b391.appspot.com",
//   messagingSenderId: "529796645033",
//   appId: "1:529796645033:web:57ce9d2ed9dd41ffc169b8",
//   measurementId: "G-9WHDJF93Z0"
//   };

export const firebaseConfig = {
  apiKey: "AIzaSyAV6TIGaLM3m85pmmxx7QJ7awv-ZKA9HBI",
  authDomain: "zwigato-9b391.firebaseapp.com",
  projectId: "zwigato-9b391",
  storageBucket: "zwigato-9b391.appspot.com",
  messagingSenderId: "529796645033",
  appId: "1:529796645033:web:4ef7850d77724499c169b8",
  measurementId: "G-GNDF36158X"
};


// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// //export const db = initializeFirestore(app, {useFetchStreams: false})
// export const storage=getStorage(app)

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestoreDB = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const db = getFirestore(app);
//export const db = initializeFirestore(app, {useFetchStreams: false})
export const storage = getStorage(app);
