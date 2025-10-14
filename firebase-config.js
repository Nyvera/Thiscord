// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQhpqcC306D0JJuuYvpjCR5P_NVWEZfkA",
  authDomain: "thiscord-b16f5.firebaseapp.com",
  projectId: "thiscord-b16f5",
  storageBucket: "thiscord-b16f5.firebasestorage.app",
  messagingSenderId: "555889737307",
  appId: "1:555889737307:web:5bd4e385fddbcaa7ff497e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
