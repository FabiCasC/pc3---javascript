"use client"

import { useEffect, useState } from "react"
import { AuthPage } from "@/components/AuthPage"
import { MasonryFeed } from "@/components/MasonryFeed"
import { AppHeader } from "@/components/AppHeader"
import { getCurrentUser } from "@/lib/auth"
import type { Pin, User } from "@/lib/db"
import { getDatabase } from "@/lib/db"

export default function Home() {
  const [isLogged, setIsLogged] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [pins, setPins] = useState<Pin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser()
    setIsLogged(!!user)
    setCurrentUser(user)

    // Load database
    getDatabase().then((db) => {
      setPins(db.pins || [])
      setUsers(db.users || [])
      setIsLoading(false)
    })
  }, [refreshKey])

  const handleAuthSuccess = () => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsLogged(true)
    setRefreshKey((prev) => prev + 1)
  }

  const handleLogout = () => {
    setIsLogged(false)
    setCurrentUser(null)
  }

  if (!isLogged) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onPinCreated={() => setRefreshKey((prev) => prev + 1)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">Explore Creations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover amazing work from talented artists, designers, and creators around the world.
          </p>
        </div>

        {pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground mb-4 text-lg">No creations yet</p>
            <p className="text-sm text-muted-foreground/70">
              Be the first to share your work. Click the Create button to upload your first pin.
            </p>
          </div>
        ) : (
          <MasonryFeed pins={pins} users={users} />
        )}
      </main>
    </div>
  )
}
