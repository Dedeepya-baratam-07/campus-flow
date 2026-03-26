// firebase-init.js - Initialize Firebase with user provided configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    setDoc,
    getDoc,
    getDocs, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6mUjxRSwvLBB0phlj1UeHE4Z1L022D00",
  authDomain: "myproj-cb88e.firebaseapp.com",
  projectId: "myproj-cb88e",
  storageBucket: "myproj-cb88e.firebasestorage.app",
  messagingSenderId: "1008561873173",
  appId: "1:1008561873173:web:8582cfea4d4dded9c3c91c",
  measurementId: "G-QKXYL0PTB6"
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Expose internal functions to window for use in non-module scripts
window.fb = {
    app, auth, db,
    // Auth
    signIn: signInWithEmailAndPassword,
    signUp: createUserWithEmailAndPassword,
    signOut: signOut,
    onAuth: onAuthStateChanged,
    updateUser: updateProfile,
    resetPass: sendPasswordResetEmail,
    // Firestore
    col: collection,
    add: addDoc,
    set: setDoc,
    get: getDoc,
    getAll: getDocs,
    qry: query,
    whr: where,
    ord: orderBy,
    snap: onSnapshot,
    ts: serverTimestamp,
    docRef: doc,
    upd: updateDoc
};

console.log("🔥 Firebase: Tools loaded and ready!");
