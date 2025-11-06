// Configuración de Firebase
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDq7CpDXELeUBP8ZDXJRXfAl6eUigPbfLc",
  authDomain: "creaza-146d4.firebaseapp.com",
  projectId: "creaza-146d4",
  storageBucket: "creaza-146d4.firebasestorage.app",
  messagingSenderId: "592945502971",
  appId: "1:592945502971:web:59e15bf49cf4a89d74ae5e"
}

// Inicializar Firebase solo una vez
let app: FirebaseApp
let auth: Auth
let db: Firestore

if (getApps().length === 0) {
  // Si no hay apps inicializadas, crear una nueva
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
} else {
  // Si ya hay una app inicializada, usar la existente
  app = getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }
export default app

