

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// --- IMPORTANT NOTE FOR DEVELOPERS ---
// If you are encountering an `auth/unauthorized-domain` error when using Google Sign-In,
// it is because the domain you are running the app on (e.g., AI Studio) is not
// whitelisted in your Firebase project's authentication settings.
//
// This is a security feature of Firebase and CANNOT be fixed by changing the code.
//
// TO FIX THIS:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project (`diabassis-b5cab`).
// 3. In the left-side menu, go to "Authentication".
// 4. Click on the "Settings" tab.
// 5. Under the "Authorized domains" section, click "Add domain".
// 6. Enter the domain `aistudio.google.com` and click "Add".
//
// After adding the domain, Google Sign-In should work correctly from AI Studio.

// --- Firebase Configuration ---
// This configuration connects the app to your Firebase project.
const firebaseConfig = {
    apiKey: "AIzaSyCJXtPfRJVZjvNkVchEaNCtbbPBglwrW0U",
    authDomain: "diabassis-b5cab.firebaseapp.com",
    projectId: "diabassis-b5cab",
    storageBucket: "diabassis-b5cab.firebasestorage.app",
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
export const functions = getFunctions(app);
export const storage = getStorage(app);