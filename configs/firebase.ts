import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPq8E6oiIw_Ar4ww5ngAc0QrpiilDlh0U",
  authDomain: "humane-e74f5.firebaseapp.com",
  projectId: "humane-e74f5",
  storageBucket: "humane-e74f5.firebasestorage.app",
  messagingSenderId: "185079517201",
  appId: "1:185079517201:web:c30208723f1beac4a5e1b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export default auth ;