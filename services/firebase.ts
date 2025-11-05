import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- ATTENTION ---
// Ces clés ont été ajoutées directement dans le code pour faciliter le développement.
// Pour une application en production, il est IMPÉRATIF de les déplacer
// dans des variables d'environnement sécurisées.
const firebaseConfig = {
    apiKey: "AIzaSyCJXtPfRJVZjvNkVchEaNCtbbPBglwrW0U",
    authDomain: "diabassis-b5cab.firebaseapp.com",
    projectId: "diabassis-b5cab",
    storageBucket: "diabassis-b5cab.firebasestorage.app",
    messagingSenderId: "275017103637",
    appId: "1:275017103637:web:068ed0e4fda4083eaf511c",
};

// Initialize Firebase App (prevent re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
