// firebase-init.js - Initialize Firebase with user provided configuration
// Using ESM import strategy to align with user snippet

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
// Add other products you need here (firestore, auth, etc.)
// import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6mUjxRSwvLBB0phlj1UeHE4Z1L022D00",
  authDomain: "myproj-cb88e.firebaseapp.com",
  projectId: "myproj-cb88e",
  storageBucket: "myproj-cb88e.firebasestorage.app",
  messagingSenderId: "1008561873173",
  appId: "1:1008561873173:web:8582cfea4d4dded9c3c91c",
  measurementId: "G-QKXYL0PTB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Expose to global scope so existing js/app.js can potentially use them
window.firebaseApp = app;
window.firebaseAnalytics = analytics;

console.log("🔥 Firebase initialized successfully!");
