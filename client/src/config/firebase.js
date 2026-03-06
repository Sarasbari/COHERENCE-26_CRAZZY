// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAKFMWnW6MTKB2asdfs-6CazavmPXiKm40",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "govtech-83e55.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://govtech-83e55-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "govtech-83e55",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "govtech-83e55.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "892280634461",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:892280634461:web:45ae004ca951a79195a1b4",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-77J68F2V5J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
