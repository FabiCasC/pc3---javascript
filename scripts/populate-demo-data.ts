// Script para poblar Firestore con datos de demo
// Ejecutar: npx tsx scripts/populate-demo-data.ts

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDq7CpDXELeUBP8ZDXJRXfAl6eUigPbfLc",
  authDomain: "creaza-146d4.firebaseapp.com",
  projectId: "creaza-146d4",
  storageBucket: "creaza-146d4.firebasestorage.app",
  messagingSenderId: "592945502971",
  appId: "1:592945502971:web:59e15bf49cf4a89d74ae5e"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Imágenes disponibles en /public
const images = [
  "/abstract-art-colors-geometric.jpg",
  "/city-skyline-urban-buildings.jpg",
  "/desert-sand-dunes-landscape.jpg",
  "/flowers-garden-floral-nature.jpg",
  "/forest-path-trees-green.jpg",
  "/modern-architecture-building-design.jpg",
  "/ocean-waves-sea-beach.jpg",
  "/serene-mountain-landscape.png",
  "/sunset-sky-orange-colors.jpg",
  "/urban-street-photography.png",
]

// Categorías
const categories = ["illustration", "design", "photography", "concept-art", "drawing"] as const

// Tags comunes
const allTags = ["arte", "diseño", "fotografía", "ilustración", "concepto", "digital", "colores", "naturaleza", "arquitectura", "urbano", "paisaje", "abstracto", "moderno", "creativo"]

async function getOrCreateUser(email: string, password: string, userData: {
  username: string
  displayName: string
  bio: string
  avatar: string
}): Promise<string | null> {
  try {
    // Intentar crear usuario en Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userId = userCredential.user.uid
    
    // Crear documento en Firestore con el userId como ID del documento
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      email,
      createdAt: Timestamp.now(),
    })
    console.log(`✅ Usuario creado: ${userData.username} (${userId})`)
    return userId
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Usuario ya existe en Auth: ${email}, iniciando sesión...`)
      
      try {
        // Iniciar sesión para obtener el UID y autenticarnos
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const userId = userCredential.user.uid
        
        // Verificar si existe en Firestore
        const userDocRef = doc(db, 'users', userId)
        const userDoc = await getDoc(userDocRef)
        
        if (!userDoc.exists()) {
          // Crear documento si no existe
          await setDoc(userDocRef, {
            ...userData,
            email,
            createdAt: Timestamp.now(),
          })
          console.log(`✅ Documento creado en Firestore para usuario existente: ${userId}`)
        } else {
          console.log(`✅ Usuario encontrado en Firestore: ${userId}`)
        }
        
        return userId
      } catch (signInError: any) {
        console.error(`❌ Error al iniciar sesión: ${signInError.message}`)
        return null
      }
    }
    throw error
  }
}

async function createDemoPin(userId: string, index: number) {
  const imageIndex = index % images.length
  const categoryIndex = index % categories.length
  const tagCount = Math.floor(Math.random() * 3) + 2 // 2-4 tags
  const selectedTags = allTags.sort(() => Math.random() - 0.5).slice(0, tagCount)
  
  const titles = [
    "Obra de Arte Abstracta",
    "Diseño Urbano Moderno",
    "Paisaje Natural Sereno",
    "Ilustración Digital",
    "Fotografía Artística",
    "Concept Art Creativo",
    "Arquitectura Contemporánea",
    "Arte Visual Inspirador",
    "Diseño Creativo",
    "Paisaje Onírico",
    "Arte Conceptual",
    "Fotografía Urbana",
    "Ilustración Colorida",
    "Diseño Minimalista",
    "Arte Abstracto",
    "Paisaje Natural",
    "Fotografía Artística",
    "Concept Art",
    "Diseño Moderno",
    "Arte Digital"
  ]
  
  const descriptions = [
    "Una obra de arte que captura la esencia de la creatividad y la expresión visual.",
    "Explorando los límites entre el diseño y el arte, creando algo único y memorable.",
    "Un paisaje que inspira paz y tranquilidad, capturando la belleza natural.",
    "Ilustración digital que combina colores vibrantes con formas geométricas.",
    "Fotografía artística que cuenta una historia visual única.",
    "Concept art que explora nuevas ideas y visiones creativas.",
    "Arquitectura que fusiona lo moderno con lo funcional.",
    "Arte visual que conecta emociones y experiencias.",
    "Diseño creativo que desafía las convenciones.",
    "Una visión onírica del mundo que nos rodea."
  ]
  
  try {
    await addDoc(collection(db, 'pins'), {
      userId,
      title: titles[index % titles.length],
      description: descriptions[index % descriptions.length],
      image: images[imageIndex],
      category: categories[categoryIndex],
      tags: selectedTags,
      likes: Math.floor(Math.random() * 50),
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)), // Últimos 30 días
    })
    console.log(`✅ Pin creado: ${index + 1}`)
  } catch (error) {
    console.error(`❌ Error creando pin ${index + 1}:`, error)
  }
}

async function populateDemoData() {
  console.log('🚀 Iniciando población de datos de demo...\n')
  
  try {
    // Primero, intentar crear o iniciar sesión con el primer usuario
    // Esto asegura que tengamos autenticación para escribir
    const demoUsers = [
      { email: "demo1@creaza.com", password: "demo123456", username: "artista_demo", displayName: "Artista Demo", bio: "Amante del arte y la creatividad", avatar: "/placeholder-user.jpg" },
      { email: "demo2@creaza.com", password: "demo123456", username: "diseñador_demo", displayName: "Diseñador Demo", bio: "Diseñador apasionado por la innovación", avatar: "/placeholder-user.jpg" },
      { email: "demo3@creaza.com", password: "demo123456", username: "fotografo_demo", displayName: "Fotógrafo Demo", bio: "Capturando momentos únicos", avatar: "/placeholder-user.jpg" },
    ]
    
    // Crear o autenticar usuarios
    const userIds: string[] = []
    
    console.log('👤 Creando/autenticando usuarios...\n')
    for (const user of demoUsers) {
      const userId = await getOrCreateUser(user.email, user.password, {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar
      })
      if (userId) {
        userIds.push(userId)
        console.log(`✅ Usuario listo: ${user.username} (${userId})\n`)
      }
    }
    
    // Si no hay usuarios, intentar obtener cualquier usuario existente de Firestore
    if (userIds.length === 0) {
      console.log('⚠️  No se pudieron crear usuarios. Buscando usuarios existentes...')
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        if (!usersSnapshot.empty) {
          const firstUser = usersSnapshot.docs[0]
          const userData = firstUser.data()
          // Intentar iniciar sesión con este usuario si tenemos su email
          if (userData.email) {
            try {
              // Intentar iniciar sesión (puede fallar si no conocemos la contraseña)
              console.log(`⚠️  Usuario encontrado pero necesitamos autenticación.`)
              console.log(`💡 Por favor, crea un usuario manualmente desde la app o ejecuta el script después de crear usuarios.`)
              return
            } catch (e) {
              console.error('No se puede autenticar con usuario existente:', e)
            }
          }
          userIds.push(firstUser.id)
          console.log(`✅ Usando usuario existente: ${firstUser.id}`)
        } else {
          console.log('❌ No hay usuarios en Firestore. El script necesita crear usuarios primero.')
          console.log('💡 Asegúrate de que las reglas de Firestore permitan crear usuarios.')
          console.log('💡 O crea un usuario manualmente desde la app y luego ejecuta este script.')
          return
        }
      } catch (e: any) {
        console.error('❌ Error buscando usuarios existentes:', e.message)
        if (e.code === 'permission-denied') {
          console.log('💡 Las reglas de Firestore no permiten lectura. Verifica las reglas en Firebase Console.')
        }
        return
      }
    }
    
    const mainUserId = userIds[0]
    console.log(`\n📸 Creando pins con usuario: ${mainUserId}\n`)
    
    // Verificar cuántos pins ya existen
    const existingPinsSnapshot = await getDocs(collection(db, 'pins'))
    const existingPinsCount = existingPinsSnapshot.size
    console.log(`📊 Pins existentes: ${existingPinsCount}`)
    
    // Crear muchos pins (80-100 para que el home se vea lleno)
    const numberOfPins = 100
    const pinsToCreate = Math.max(0, numberOfPins - existingPinsCount)
    
    if (pinsToCreate === 0) {
      console.log(`✅ Ya hay suficientes pins (${existingPinsCount}). No se crearán más.`)
    } else {
      console.log(`📸 Creando ${pinsToCreate} pins nuevos...\n`)
      for (let i = 0; i < pinsToCreate; i++) {
        await createDemoPin(mainUserId, i)
        // Pequeña pausa para no sobrecargar
        if (i % 10 === 0 && i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      console.log(`\n✅ ${pinsToCreate} pins creados. Total: ${existingPinsCount + pinsToCreate}`)
    }
    
    console.log(`\n✅ ¡Completado!`)
    console.log(`\n📝 Credenciales de usuarios demo (si se crearon):`)
    demoUsers.forEach(u => {
      console.log(`   Email: ${u.email} / Password: demo123456`)
    })
    console.log(`\n💡 Puedes usar estos usuarios para iniciar sesión en la aplicación.`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar
populateDemoData().then(() => {
  console.log('\n✨ Script completado!')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})

