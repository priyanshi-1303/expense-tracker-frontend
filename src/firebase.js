// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlILKlxaiidm83Rg9cAdrYbHXY1_DkQlY",
  authDomain: "expense-tracker-fad2a.firebaseapp.com",
  projectId: "expense-tracker-fad2a",
  storageBucket: "expense-tracker-fad2a.firebasestorage.app",
  messagingSenderId: "11317861277",
  appId: "1:11317861277:web:b04ac74a0305e354f1ed74",
  measurementId: "G-HS8L058HDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
