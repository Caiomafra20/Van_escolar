import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Substitua pelas suas credenciais do Console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTvlujToSUX3JvLakYv9Dwt-9B7sgW7t8",
  authDomain: "financeiro-32139.firebaseapp.com",
  projectId: "financeiro-32139",
  storageBucket: "financeiro-32139.firebasestorage.app",
  messagingSenderId: "929380352090",
  appId: "1:929380352090:web:e5ea8655635e8f52e05863",
  measurementId: "G-L5CRVME2EP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);