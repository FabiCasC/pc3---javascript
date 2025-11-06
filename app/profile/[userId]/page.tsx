"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getUserById, getUserPins, getDatabase } from "@/lib/db"
import type { User, Pin } from "@/lib/db"
import { AppHeader } from "@/components/AppHeader"
import { getCurrentUser, isLoggedIn } from "@/lib/auth"
import { MasonryFeed } from "@/components/MasonryFeed"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<User | null>(null)
  const [profilePins, setProfilePins] = useState<Pin[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const current = getCurrentUser()
    setCurrentUser(current)

    // Load user profile and their pins
    Promise.all([getUserById(userId), getUserPins(userId), getDatabase()]).then(([user, pins, db]) => {
      setProfile(user)
      setProfilePins(pins)
      setAllUsers(db.users || [])
      setIsLoading(false)
    })
  }, [userId])

  if (!isLoggedIn()) {
    return router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentUser={currentUser} onLogout={() => router.push("/")} />
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentUser={currentUser} onLogout={() => router.push("/")} />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">User not found</p>
          <Link href="/" className="text-primary hover:underline">
            Return to gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentUser={currentUser} onLogout={() => router.push("/")} />

      <div className="bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-indigo-600/10 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <img
                src={profile.avatar || "/placeholder.svg"}
                alt={profile.displayName}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">{profile.displayName}</h1>
                  <p className="text-lg text-muted-foreground">@{profile.username}</p>
                  <p className="mt-4 text-foreground max-w-md">{profile.bio}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{profilePins.length}</p>
                    <p className="text-xs text-muted-foreground">Creations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {profilePins.reduce((sum, pin) => sum + pin.likes, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>

              {currentUser?.id !== userId && (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`mt-6 px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowing
                      ? "bg-border text-foreground hover:bg-border/80"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-foreground">Portfolio</h2>

        {profilePins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">No creations yet</p>
            <p className="text-sm text-muted-foreground/70">
              {currentUser?.id === userId
                ? "Share your first creation to get started"
                : "This creator hasn't shared any work yet"}
            </p>
          </div>
        ) : (
          <MasonryFeed pins={profilePins} users={allUsers} />
        )}
      </div>
    </div>
  )
}
