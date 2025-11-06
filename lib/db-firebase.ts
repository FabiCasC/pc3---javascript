// Base de datos con Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../src/lib/firebase'
import type { User } from '@/lib/auth'

// Re-export User type for convenience
export type { User } from '@/lib/auth'

export type Comment = {
  id: string
  pinId: string
  userId: string
  text: string
  createdAt: string
}

export type Pin = {
  id: string
  userId: string
  title: string
  description: string
  image: string
  category: "illustration" | "design" | "photography" | "concept-art" | "drawing"
  tags?: string[]
  likes: number
  createdAt: string
}

export type Notification = {
  id: string
  userId: string
  type: "like" | "comment" | "follow" | "mention"
  fromUserId: string
  pinId?: string
  commentId?: string
  text?: string
  read: boolean
  createdAt: string
}

export type Collection = {
  id: string
  userId: string
  name: string
  description?: string
  pinIds: string[]
  createdAt: string
}

// Helper para convertir Firestore Timestamp a string
function timestampToString(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString().split('T')[0]
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString().split('T')[0]
  }
  return timestamp || new Date().toISOString().split('T')[0]
}

// Helper para convertir string a Firestore Timestamp
function stringToTimestamp(dateString: string): Timestamp {
  return Timestamp.fromDate(new Date(dateString))
}

// ===== USERS =====
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        id: userDoc.id,
        username: data.username || '',
        email: data.email || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        avatar: data.avatar || '/placeholder-user.jpg',
        createdAt: timestampToString(data.createdAt),
      } as User
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username), limit(1))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        avatar: data.avatar || '/placeholder-user.jpg',
        createdAt: timestampToString(data.createdAt),
      } as User
    }
    return null
  } catch (error) {
    console.error('Error getting user by username:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email), limit(1))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        avatar: data.avatar || '/placeholder-user.jpg',
        createdAt: timestampToString(data.createdAt),
      } as User
    }
    return null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username || '',
        email: data.email || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        avatar: data.avatar || '/placeholder-user.jpg',
        createdAt: timestampToString(data.createdAt),
      } as User
    })
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId)
    const updateData: any = {}
    
    if (updates.displayName !== undefined) updateData.displayName = updates.displayName
    if (updates.username !== undefined) updateData.username = updates.username
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar
    
    await updateDoc(userRef, updateData)
    
    // Return updated user
    return await getUserById(userId)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return null
  }
}

// ===== PINS =====
export async function getPinById(pinId: string): Promise<Pin | null> {
  try {
    const pinDoc = await getDoc(doc(db, 'pins', pinId))
    if (pinDoc.exists()) {
      const data = pinDoc.data()
      return {
        id: pinDoc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes || 0,
        createdAt: timestampToString(data.createdAt),
      } as Pin
    }
    return null
  } catch (error) {
    console.error('Error getting pin:', error)
    return null
  }
}

export async function getAllPins(): Promise<Pin[]> {
  try {
    // Try to order by createdAt, but if index doesn't exist, get all and sort in memory
    let querySnapshot
    try {
      const q = query(collection(db, 'pins'), orderBy('createdAt', 'desc'))
      querySnapshot = await getDocs(q)
    } catch (indexError: any) {
      // If index doesn't exist, get all and sort
      if (indexError.code === 'failed-precondition') {
        console.warn('⚠️ Index not found, fetching all pins without order. Firebase te pedirá crear el índice.')
      }
      querySnapshot = await getDocs(collection(db, 'pins'))
    }
    
    const pins = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes || 0,
        createdAt: timestampToString(data.createdAt),
      } as Pin
    })
    
    // Sort by createdAt desc if not already sorted
    const sortedPins = pins.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    console.log(`📊 getAllPins: ${sortedPins.length} pins encontrados`)
    return sortedPins
  } catch (error) {
    console.error('❌ Error getting all pins:', error)
    return []
  }
}

export async function getUserPins(userId: string): Promise<Pin[]> {
  try {
    // Try with orderBy, fallback to sorting in memory if index doesn't exist
    let querySnapshot
    try {
      const q = query(collection(db, 'pins'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
      querySnapshot = await getDocs(q)
    } catch (indexError) {
      // If index doesn't exist, get without orderBy and sort
      console.warn('Index not found, fetching user pins without order:', indexError)
      const q = query(collection(db, 'pins'), where('userId', '==', userId))
      querySnapshot = await getDocs(q)
    }
    
    const pins = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes || 0,
        createdAt: timestampToString(data.createdAt),
      } as Pin
    })
    
    // Sort by createdAt desc if not already sorted
    return pins.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error getting user pins:', error)
    return []
  }
}

export async function addPin(pin: Omit<Pin, "id" | "createdAt" | "likes">): Promise<Pin> {
  try {
    const pinData = {
      userId: pin.userId,
      title: pin.title,
      description: pin.description,
      image: pin.image,
      category: pin.category,
      tags: pin.tags || [],
      likes: 0,
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'pins'), pinData)
    
    return {
      id: docRef.id,
      ...pin,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('Error adding pin:', error)
    throw error
  }
}

export async function updatePinLikes(pinId: string, increment: boolean, currentUserId?: string): Promise<Pin | null> {
  try {
    const pinRef = doc(db, 'pins', pinId)
    const pinDoc = await getDoc(pinRef)
    
    if (!pinDoc.exists()) {
      return null
    }
    
    const currentLikes = pinDoc.data().likes || 0
    const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1)
    
    await updateDoc(pinRef, { likes: newLikes })
    
    // Create notification for pin owner if liked
    if (increment && currentUserId) {
      const pinData = pinDoc.data()
      if (pinData.userId !== currentUserId) {
        await createNotification({
          userId: pinData.userId,
          type: 'like',
          fromUserId: currentUserId,
          pinId: pinId,
        })
      }
    }
    
    return await getPinById(pinId)
  } catch (error) {
    console.error('Error updating pin likes:', error)
    return null
  }
}

// ===== COMMENTS =====
export async function getPinComments(pinId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('pinId', '==', pinId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        pinId: data.pinId,
        userId: data.userId,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Comment
    })
  } catch (error) {
    console.error('Error getting comments:', error)
    return []
  }
}

export async function addComment(comment: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
  try {
    const commentData = {
      pinId: comment.pinId,
      userId: comment.userId,
      text: comment.text,
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'comments'), commentData)
    
    // Create notification for pin owner
    const pin = await getPinById(comment.pinId)
    if (pin && comment.userId !== pin.userId) {
      await createNotification({
        userId: pin.userId,
        type: 'comment',
        fromUserId: comment.userId,
        pinId: comment.pinId,
        commentId: docRef.id,
      })
    }
    
    return {
      id: docRef.id,
      ...comment,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

// ===== FOLLOWS =====
export async function followUser(followerId: string, followingId: string): Promise<void> {
  try {
    const followId = `${followerId}_${followingId}`
    await setDoc(doc(db, 'follows', followId), {
      followerId,
      followingId,
      createdAt: Timestamp.now(),
    })
    
    // Create notification
    await createNotification({
      userId: followingId,
      type: 'follow',
      fromUserId: followerId,
    })
  } catch (error) {
    console.error('Error following user:', error)
    throw error
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    const followId = `${followerId}_${followingId}`
    await deleteDoc(doc(db, 'follows', followId))
  } catch (error) {
    console.error('Error unfollowing user:', error)
    throw error
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const followId = `${followerId}_${followingId}`
    const followDoc = await getDoc(doc(db, 'follows', followId))
    return followDoc.exists()
  } catch (error) {
    console.error('Error checking follow:', error)
    return false
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting following count:', error)
    return 0
  }
}

export async function getFollowersCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, 'follows'), where('followingId', '==', userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting followers count:', error)
    return 0
  }
}

// ===== NOTIFICATIONS =====
export async function createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> {
  try {
    const notificationData = {
      userId: notification.userId,
      type: notification.type,
      fromUserId: notification.fromUserId,
      pinId: notification.pinId || null,
      commentId: notification.commentId || null,
      text: notification.text || null,
      read: false,
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData)
    
    return {
      id: docRef.id,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    // Try with orderBy, fallback if index doesn't exist
    let querySnapshot
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      querySnapshot = await getDocs(q)
    } catch (indexError) {
      // If index doesn't exist, get without orderBy
      console.warn('Index not found, fetching notifications without order:', indexError)
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), limit(50))
      querySnapshot = await getDocs(q)
    }
    
    const notifications = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        fromUserId: data.fromUserId,
        pinId: data.pinId,
        commentId: data.commentId,
        text: data.text,
        read: data.read || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Notification
    })
    
    // Sort by createdAt desc if not already sorted
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error getting notifications:', error)
    return []
  }
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)
    
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true })
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

// ===== COLLECTIONS =====
export async function createCollection(userId: string, name: string, description?: string): Promise<Collection> {
  try {
    const collectionData = {
      userId,
      name,
      description: description || '',
      pinIds: [],
      createdAt: Timestamp.now(),
    }
    
    const docRef = await addDoc(collection(db, 'collections'), collectionData)
    
    return {
      id: docRef.id,
      userId,
      name,
      description,
      pinIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}

export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    const q = query(
      collection(db, 'collections'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        pinIds: data.pinIds || [],
        createdAt: timestampToString(data.createdAt),
      } as Collection
    })
  } catch (error) {
    console.error('Error getting collections:', error)
    return []
  }
}

export async function addPinToCollection(collectionId: string, pinId: string): Promise<void> {
  try {
    const collectionRef = doc(db, 'collections', collectionId)
    const collectionDoc = await getDoc(collectionRef)
    
    if (collectionDoc.exists()) {
      const currentPinIds = collectionDoc.data().pinIds || []
      if (!currentPinIds.includes(pinId)) {
        await updateDoc(collectionRef, {
          pinIds: [...currentPinIds, pinId]
        })
      }
    }
  } catch (error) {
    console.error('Error adding pin to collection:', error)
    throw error
  }
}

export async function removePinFromCollection(collectionId: string, pinId: string): Promise<void> {
  try {
    const collectionRef = doc(db, 'collections', collectionId)
    const collectionDoc = await getDoc(collectionRef)
    
    if (collectionDoc.exists()) {
      const currentPinIds = collectionDoc.data().pinIds || []
      await updateDoc(collectionRef, {
        pinIds: currentPinIds.filter((id: string) => id !== pinId)
      })
    }
  } catch (error) {
    console.error('Error removing pin from collection:', error)
    throw error
  }
}

export async function getCollectionById(collectionId: string): Promise<Collection | null> {
  try {
    const collectionDoc = await getDoc(doc(db, 'collections', collectionId))
    if (collectionDoc.exists()) {
      const data = collectionDoc.data()
      return {
        id: collectionDoc.id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        pinIds: data.pinIds || [],
        createdAt: timestampToString(data.createdAt),
      } as Collection
    }
    return null
  } catch (error) {
    console.error('Error getting collection:', error)
    return null
  }
}

export async function deleteCollection(collectionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'collections', collectionId))
  } catch (error) {
    console.error('Error deleting collection:', error)
    throw error
  }
}

// ===== SEARCH =====
export async function searchPins(queryText: string, category?: string, tags?: string[]): Promise<Pin[]> {
  try {
    let q: any = collection(db, 'pins')
    const constraints: any[] = []
    
    if (category) {
      constraints.push(where('category', '==', category))
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints)
    }
    
    const querySnapshot = await getDocs(q)
    let pins = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes || 0,
        createdAt: timestampToString(data.createdAt),
      } as Pin
    })
    
    // Filter by search query
    if (queryText) {
      const lowerQuery = queryText.toLowerCase()
      pins = pins.filter(pin => 
        pin.title.toLowerCase().includes(lowerQuery) ||
        pin.description.toLowerCase().includes(lowerQuery) ||
        pin.category.toLowerCase().includes(lowerQuery) ||
        (pin.tags && pin.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      pins = pins.filter(pin => 
        pin.tags && tags.some(tag => pin.tags!.includes(tag))
      )
    }
    
    return pins
  } catch (error) {
    console.error('Error searching pins:', error)
    return []
  }
}

// ===== TRENDING =====
export async function getTrendingPins(limitCount: number = 20): Promise<Pin[]> {
  try {
    // Get all pins and sort by likes and recency (can't use multiple orderBy without composite index)
    const q = query(collection(db, 'pins'), orderBy('likes', 'desc'), limit(limitCount * 2))
    const querySnapshot = await getDocs(q)
    const pins = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        tags: data.tags || [],
        likes: data.likes || 0,
        createdAt: timestampToString(data.createdAt),
      } as Pin
    })
    
    // Sort by a combination of likes and recency
    return pins
      .sort((a, b) => {
        const aScore = a.likes * 2 + (new Date().getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        const bScore = b.likes * 2 + (new Date().getTime() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        return bScore - aScore
      })
      .slice(0, limitCount)
  } catch (error) {
    console.error('Error getting trending pins:', error)
    // Fallback: just get recent pins
    try {
      const q = query(collection(db, 'pins'), orderBy('createdAt', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          image: data.image,
          category: data.category,
          tags: data.tags || [],
          likes: data.likes || 0,
          createdAt: timestampToString(data.createdAt),
        } as Pin
      })
    } catch (fallbackError) {
      console.error('Error in fallback trending pins:', fallbackError)
      return []
    }
  }
}

// ===== TAGS =====
export async function getAllTags(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'pins'))
    const tagsSet = new Set<string>()
    querySnapshot.docs.forEach(doc => {
      const tags = doc.data().tags || []
      tags.forEach((tag: string) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  } catch (error) {
    console.error('Error getting all tags:', error)
    return []
  }
}

// ===== LIKES (LocalStorage para mantener compatibilidad) =====
const LIKES_STORAGE_KEY = "creaza_user_likes"

export function getUserLikes(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {}
  }
  const stored = localStorage.getItem(LIKES_STORAGE_KEY)
  return stored ? JSON.parse(stored) : {}
}

export function setUserLike(pinId: string, isLiked: boolean): void {
  if (typeof window === "undefined") {
    return
  }
  const likes = getUserLikes()
  if (isLiked) {
    likes[pinId] = true
  } else {
    delete likes[pinId]
  }
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes))
}

export function isPinLikedByUser(pinId: string): boolean {
  const likes = getUserLikes()
  return !!likes[pinId]
}

// ===== COMPATIBILITY =====
// Mantener compatibilidad con el código existente
export async function getDatabase(): Promise<{ users: User[], pins: Pin[], comments: Comment[], follows: any[], notifications: Notification[], collections: Collection[] }> {
  try {
    const [users, pins, comments, notifications, collections] = await Promise.all([
      getAllUsers(),
      getAllPins(),
      getAllComments(),
      getAllNotifications(),
      getAllCollections(),
    ])
    
    // Get follows
    const followsSnapshot = await getDocs(collection(db, 'follows'))
    const follows = followsSnapshot.docs.map(doc => doc.data())
    
    return {
      users,
      pins,
      comments,
      follows,
      notifications,
      collections,
    }
  } catch (error) {
    console.error('Error getting database:', error)
    return {
      users: [],
      pins: [],
      comments: [],
      follows: [],
      notifications: [],
      collections: [],
    }
  }
}

async function getAllComments(): Promise<Comment[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'comments'))
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        pinId: data.pinId,
        userId: data.userId,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Comment
    })
  } catch (error) {
    console.error('Error getting all comments:', error)
    return []
  }
}

async function getAllNotifications(): Promise<Notification[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'notifications'))
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        fromUserId: data.fromUserId,
        pinId: data.pinId,
        commentId: data.commentId,
        text: data.text,
        read: data.read || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Notification
    })
  } catch (error) {
    console.error('Error getting all notifications:', error)
    return []
  }
}

async function getAllCollections(): Promise<Collection[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'collections'))
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        name: data.name,
        description: data.description,
        pinIds: data.pinIds || [],
        createdAt: timestampToString(data.createdAt),
      } as Collection
    })
  } catch (error) {
    console.error('Error getting all collections:', error)
    return []
  }
}

