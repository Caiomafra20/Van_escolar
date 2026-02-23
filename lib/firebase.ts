import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCTvlujToSUX3JvLakYv9Dwt-9B7sgW7t8",
  authDomain: "financeiro-32139.firebaseapp.com",
  projectId: "financeiro-32139",
  storageBucket: "financeiro-32139.firebasestorage.app",
  messagingSenderId: "929380352090",
  appId: "1:929380352090:web:e5ea8655635e8f52e05863",
  measurementId: "G-L5CRVME2EP"
};

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (e) {
  console.error("[v0] Firebase initialization error:", e)
  app = {} as FirebaseApp
  auth = {} as Auth
  db = {} as Firestore
  storage = {} as FirebaseStorage
}

export { app, auth, db, storage }
