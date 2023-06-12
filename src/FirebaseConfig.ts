import { initializeApp } from "firebase/app";
import { getAuth, FacebookAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBtpxZZZmTMSL0utPgsUmjhI7sA_0TTFuI",
  authDomain: "test-crud-32195.firebaseapp.com",
  databaseURL: "https://test-crud-32195-default-rtdb.firebaseio.com",
  projectId: "test-crud-32195",
  storageBucket: "test-crud-32195.appspot.com",
  messagingSenderId: "343964935783",
  appId: "1:343964935783:web:b4242aea09d8f76a7756c2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new FacebookAuthProvider();

export {auth, provider}