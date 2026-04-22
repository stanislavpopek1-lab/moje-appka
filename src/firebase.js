import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBG2pqRMi3ru4MA08bC1Hj6aOp6-KW7pHE",
  authDomain: "login-12725.firebaseapp.com",
  projectId: "login-12725",
  storageBucket: "login-12725.appspot.com",
  messagingSenderId: "837676924196",
  appId: "1:837676924196:web:5fcf0436890be34ef807b1"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🗄️ Firestore
export const db = getFirestore(app);

// 📦 Storage (TOHLE CHYBĚLO)
export const storage = getStorage(app);