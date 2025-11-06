// Base de datos migrada a Firebase
// Este archivo re-exporta todo desde db-firebase.ts para mantener compatibilidad

import type { User } from "@/lib/auth"

// Re-export types from firebase version
export type { Comment, Pin, Notification, Collection } from "./db-firebase"

// Keep Database type for compatibility
export type Database = {
  users: User[]
  pins: any[]
  comments: any[]
  follows: { followerId: string; followingId: string }[]
  notifications: any[]
  collections: any[]
}

// Re-export all functions from Firebase version
export * from "./db-firebase"

// Get database (for API compatibility) - now uses Firestore
import * as dbFirebase from "./db-firebase"
export async function getDatabase(): Promise<Database> {
  return await dbFirebase.getDatabase()
}

// Keep like functions that use localStorage (for now)
export { getUserLikes, setUserLike, isPinLikedByUser } from "./db-firebase"
