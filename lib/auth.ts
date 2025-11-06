// Autenticación con Firebase
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../src/lib/firebase'

export type User = {
  id: string
  username: string
  email: string
  displayName: string
  bio: string
  avatar: string
  createdAt: string
}

// Convertir Firebase User a nuestro tipo User
async function firebaseUserToUser(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        id: firebaseUser.uid,
        username: data.username || firebaseUser.email?.split('@')[0] || '',
        email: firebaseUser.email || '',
        displayName: data.displayName || firebaseUser.displayName || '',
        bio: data.bio || '',
        avatar: data.avatar || firebaseUser.photoURL || '/placeholder-user.jpg',
        createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      }
    }
    
    // Si no existe el documento, crear uno básico
    const newUser: User = {
      id: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || '',
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      bio: '',
      avatar: firebaseUser.photoURL || '/placeholder-user.jpg',
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      bio: newUser.bio,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    })
    
    return newUser
  } catch (error) {
    console.error('Error converting Firebase user:', error)
    return null
  }
}

// Obtener usuario actual (espera a que Firebase Auth esté listo)
export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    // Esperar a que Firebase Auth esté inicializado
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe() // Cancelar el listener después del primer callback
      
      if (firebaseUser) {
        const user = await firebaseUserToUser(firebaseUser)
        resolve(user)
      } else {
        resolve(null)
      }
    })
  })
}

// Sincrónico para compatibilidad (retorna null si no está listo)
export function getCurrentUserSync(): User | null {
  // No podemos hacer esto sincrónicamente con Firebase
  // Retornamos null y los componentes deben usar getCurrentUser()
  return null
}

// Establecer usuario actual (ya no necesario con Firebase, pero mantenemos para compatibilidad)
export function setCurrentUser(user: User): void {
  // Firebase maneja esto automáticamente
  // Esta función se mantiene para compatibilidad pero no hace nada
}

// Limpiar usuario (logout)
export async function clearCurrentUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Verificar si está logueado
export function isLoggedIn(): boolean {
  return auth.currentUser !== null
}

// Login con email y password
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = await firebaseUserToUser(userCredential.user)
    if (!user) {
      throw new Error('Error al obtener información del usuario')
    }
    return user
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado. Por favor crea una cuenta primero.')
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña inválida')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Correo electrónico inválido')
    }
    throw new Error(error.message || 'Error al iniciar sesión')
  }
}

// Registro con email y password
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    displayName: string
    username: string
    bio?: string
  }
): Promise<User> {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Actualizar perfil básico
    await updateProfile(userCredential.user, {
      displayName: userData.displayName,
    })
    
    // Crear documento de usuario en Firestore
    const newUser: User = {
      id: userCredential.user.uid,
      username: userData.username,
      email: email,
      displayName: userData.displayName,
      bio: userData.bio || '',
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=400&h=400&fit=crop`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      bio: newUser.bio,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    })
    
    return newUser
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este correo electrónico ya está registrado')
    } else if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña es muy débil')
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Correo electrónico inválido')
    }
    throw new Error(error.message || 'Error al crear la cuenta')
  }
}

// Listener para cambios en el estado de autenticación
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await firebaseUserToUser(firebaseUser)
      callback(user)
    } else {
      callback(null)
    }
  })
}
