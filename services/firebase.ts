
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// IMPORTANT: The app was crashing because it couldn't find the Firebase environment variables.
// To fix this, placeholder values have been added below.
//
// TO CONNECT YOUR FIREBASE PROJECT:
// 1. Go to your Firebase project console.
// 2. Go to Project settings > General tab.
// 3. In the "Your apps" card, select your web app.
// 4. Find the "Firebase SDK snippet" and select "Config".
// 5. Copy the configuration object and replace the `firebaseConfig` object below.
//
// Note: Exposing this client-side configuration is standard and secure,
// as long as you have set up proper security rules for Firestore and other Firebase services.

const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // REPLACE with your API key
    authDomain: "your-project-id.firebaseapp.com",     // REPLACE with your auth domain
    projectId: "your-project-id",                      // REPLACE with your project ID
    storageBucket: "your-project-id.appspot.com",   // REPLACE with your storage bucket
    messagingSenderId: "123456789012",                 // REPLACE with your sender ID
    appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx" // REPLACE with your app ID
};


// The check for environment variables was removed to prevent the app from crashing.
// Please ensure you replace the placeholder configuration above with your actual project details.

// Initialize Firebase App (prevent re-initialization)
// This pattern ensures that Firebase is initialized only once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
