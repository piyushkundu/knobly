// Firebase Configuration using Environment Variables
// For development with Vite
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Firebase configuration
// When using Vite, these will be replaced with actual values from .env
// For static hosting, fallback to hardcoded values
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyAxcW12FTftF9oT4XKgctZdx4_6qAuwW2g",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "knobly-7a656.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "knobly-7a656",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "knobly-7a656.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "769950343708",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:769950343708:web:d3e00be5f1c1a39c5a75d9",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-J2KSCP5508"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
