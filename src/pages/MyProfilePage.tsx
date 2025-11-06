import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthPage } from "@/components/AuthPage"
import { MasonryFeed } from "@/components/MasonryFeed"
import { AppHeader } from "@/components/AppHeader"
import { EditProfileModal } from "@/components/EditProfileModal"
import { getCurrentUser, isLoggedIn, clearCurrentUser } from "@/lib/auth"
import type { Pin, User } from "@/lib/db"
import { getUserPins, getFollowersCount, getFollowingCount, getAllUsers } from "@/lib/db"

export default function MyProfilePage() {
  const navigate = useNavigate()
  const [isLogged, setIsLogged] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [myPins, setMyPins] = useState<Pin[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/")
      return
    }

    const loadUser = async () => {
      const user = await getCurrentUser()
      setIsLogged(!!user)
      setCurrentUser(user)

      if (user) {
        loadProfileData(user.id)
      }
    }
    
    loadUser()
  }, [navigate, refreshKey])

  const loadProfileData = async (userId: string) => {
    try {
      const [pins, followers, following, allUsers] = await Promise.all([
        getUserPins(userId),
        getFollowersCount(userId),
        getFollowingCount(userId),
        getAllUsers()
      ])
      setMyPins(pins)
      setAllUsers(allUsers || [])
      setFollowersCount(followers)
      setFollowingCount(following)
    } catch (error) {
      console.error("Error loading profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setIsLogged(!!user)
    setRefreshKey((prev) => prev + 1)
  }

  const handleLogout = async () => {
    await clearCurrentUser()
    setIsLogged(false)
    setCurrentUser(null)
    navigate("/")
  }

  if (!isLogged) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        currentUser={currentUser}
        onLogout={handleLogout}
        onPinCreated={() => setRefreshKey((prev) => prev + 1)}
      />

      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <img
                src={currentUser.avatar || "/placeholder-user.jpg"}
                alt={currentUser.displayName}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">{currentUser.displayName}</h1>
                  <p className="text-lg text-muted-foreground">@{currentUser.username}</p>
                  <p className="mt-4 text-foreground max-w-md">{currentUser.bio || "Aún no hay biografía."}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Se unió {new Date(currentUser.createdAt).toLocaleDateString("es", { year: "numeric", month: "long" })}
                  </p>
                </div>
                <EditProfileModal 
                  onUpdate={async () => {
                    const user = await getCurrentUser()
                    setCurrentUser(user)
                    setRefreshKey(prev => prev + 1)
                  }}
                />

                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{myPins.length}</p>
                    <p className="text-xs text-muted-foreground">Creaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {myPins.reduce((sum, pin) => sum + pin.likes, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Me gusta</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{followersCount}</p>
                    <p className="text-xs text-muted-foreground">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{followingCount}</p>
                    <p className="text-xs text-muted-foreground">Siguiendo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8 text-foreground">Mis Creaciones</h2>

        {myPins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">Aún no hay creaciones</p>
            <p className="text-sm text-muted-foreground/70">
              Comparte tu primera creación para comenzar. Haz clic en el botón Crear para subir tu primer pin.
            </p>
          </div>
        ) : (
          <MasonryFeed pins={myPins} users={allUsers} />
        )}
      </div>
    </div>
  )
}

