import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

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

// --- VÉRIFICATION DE LA CONFIGURATION ---
// This check prevents the app from running with placeholder values.
if (firebaseConfig.apiKey.startsWith("VOTRE_") || !firebaseConfig.projectId) {
    const errorMessage = "ERREUR DE CONFIGURATION FIREBASE : Les clés ne sont pas définies dans services/firebase.ts. " +
    "Veuillez suivre les instructions dans ce fichier pour ajouter votre propre configuration Firebase. " +
    "L'application ne peut pas démarrer sans cela.";
    
    // Afficher l'erreur de manière visible dans la page
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="padding: 2rem; font-family: sans-serif; background-color: #fff3f3; border: 2px solid #ff0000; color: #b91c1c; margin: 2rem; border-radius: 8px;">
                <h1 style="font-size: 1.5rem; font-weight: bold;">Erreur de configuration Firebase</h1>
                <p style="margin-top: 1rem;">Les clés de votre projet Firebase ne sont pas configurées dans le fichier <strong>services/firebase.ts</strong>.</p>
                <p style="margin-top: 0.5rem;">Veuillez suivre les instructions dans les commentaires de ce fichier pour résoudre le problème.</p>
            </div>
        `;
    }
    
    // Lancer une erreur pour arrêter l'exécution du script
    throw new Error(errorMessage);
}


// Initialize Firebase App (prevent re-initialization)
// This pattern ensures that Firebase is initialized only once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);