
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// This configuration connects the app to your Firebase project.
const firebaseConfig = {
    apiKey: "AIzaSyCJXtPfRJVZjvNkVchEaNCtbbPBglwrW0U",
    authDomain: "diabassis-b5cab.firebaseapp.com",
    projectId: "diabassis-b5cab",
    storageBucket: "diabassis-b5cab.appspot.com",
    messagingSenderId: "275017103637",
    appId: "1:275017103637:web:068ed0e4fda4083eaf511c",
    measurementId: "G-EFRMPKXWTF"
};


// Initialize Firebase App (prevent re-initialization)
// This pattern ensures that Firebase is initialized only once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);