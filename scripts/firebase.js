// Firebase Configuration - ES Module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getDatabase, 
    ref, 
    push, 
    set, 
    update, 
    remove, 
    onValue, 
    get,
    child
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// 🔥 Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAGU-XW-Fs9lsZc8OyZdBgop2VmoYIj-9c",
    authDomain: "time-tracking-using-ai-5a070.firebaseapp.com",
    databaseURL: "https://time-tracking-using-ai-5a070-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "time-tracking-using-ai-5a070",
    storageBucket: "time-tracking-using-ai-5a070.firebasestorage.app",
    messagingSenderId: "262134669694",
    appId: "1:262134669694:web:707dc1278c0484bd40932f"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    database,
    googleProvider,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
    ref, 
    push, 
    set, 
    update, 
    remove, 
    onValue,
    get,
    child
};
