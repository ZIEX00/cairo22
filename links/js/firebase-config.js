import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyArvaeVw9sYdda8l479jOhtXhxI6UeZTlk",
  authDomain: "cairo22-100a7.firebaseapp.com",
  databaseURL: "https://cairo22-100a7-default-rtdb.firebaseio.com",
  projectId: "cairo22-100a7",
  storageBucket: "cairo22-100a7.firebasestorage.app",
  messagingSenderId: "883969519364",
  appId: "1:883969519364:web:31e13546128c78479aaa51",
  measurementId: "G-74EQ8TFY26"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
