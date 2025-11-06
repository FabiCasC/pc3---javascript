import { useEffect, useState, useMemo } from "react"
import { AuthPage } from "@/components/AuthPage"
import { MasonryFeed } from "@/components/MasonryFeed"
import { AppHeader } from "@/components/AppHeader"
import { FilterBar } from "@/components/FilterBar"
import { getCurrentUser, clearCurrentUser } from "@/lib/auth"
import type { Pin, User } from "@/lib/db"
import { getAllPins, getAllUsers, getTrendingPins } from "@/lib/db"
import { Flame } from "lucide-react"

export default function HomePage() {
  const [isLogged, setIsLogged] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [pins, setPins] = useState<Pin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showTrending, setShowTrending] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    let cancelled = false
    
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        const loggedIn = !!user
        
        if (cancelled) return
        
        setIsLogged(loggedIn)
        setCurrentUser(user)
        console.log(`Usuario actual:`, user ? `${user.displayName} (${user.id})` : 'No logueado')

        // Load pins directly from Firestore (cargar siempre, incluso sin login)
        const [allPins, allUsers] = await Promise.all([
          getAllPins(),
          getAllUsers()
        ])
        
        if (cancelled) return
        
        console.log(`Cargados ${allPins.length} pins desde Firestore`)
        setPins(allPins || [])
        setUsers(allUsers || [])
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        if (!cancelled) {
          setIsLogged(false)
          setCurrentUser(null)
          setIsLoading(false)
        }
      }
    }
    
    loadData()
    
    // Timeout safety - never stay loading forever
    const timeout = setTimeout(() => {
      console.warn("Loading timeout - forcing completion")
      setIsLoading(false)
    }, 5000)
    
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [refreshKey])

  const [trendingPins, setTrendingPins] = useState<Pin[]>([])

  useEffect(() => {
    if (showTrending) {
      getTrendingPins(50).then(setTrendingPins)
    }
  }, [showTrending])

  // Filter pins based on search and category
  const filteredPins = useMemo(() => {
    const pinsToFilter = showTrending ? trendingPins : pins
    if (!pinsToFilter.length) return []
    
    if (!searchTerm && !selectedCategory) {
      return pinsToFilter
    }
    return pinsToFilter.filter((pin) => {
      const matchesSearch = !searchTerm || 
        pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pin.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || pin.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [pins, trendingPins, showTrending, searchTerm, selectedCategory])

  const categories = ["illustration", "design", "photography", "concept-art", "drawing"]

  const handleAuthSuccess = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
    setIsLogged(!!user)
    setRefreshKey((prev) => prev + 1)
  }

  const handleLogout = async () => {
    try {
      await clearCurrentUser()
      // Clear localStorage likes
      localStorage.removeItem("creaza_user_likes")
      // Force reload to reset all state
      window.location.href = "/"
    } catch (error) {
      console.error("Error during logout:", error)
      // Emergency fallback
      localStorage.removeItem("creaza_user_likes")
      window.location.reload()
    }
  }

  // Mostrar pins incluso sin login, pero mostrar login si no hay usuario
  if (!isLogged && isLoading === false && pins.length === 0) {
    // Si no hay pins y no está logueado, mostrar login
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-balance mb-2">Home</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Descubre increíbles trabajos de artistas, diseñadores y creadores talentosos de todo el mundo.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowTrending(false)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  !showTrending
                    ? "bg-primary text-primary-foreground"
                    : "bg-border text-foreground hover:bg-border/80"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setShowTrending(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  showTrending
                    ? "bg-primary text-primary-foreground"
                    : "bg-border text-foreground hover:bg-border/80"
                }`}
              >
                <Flame className="w-4 h-4" />
                Trending
              </button>
            </div>
          </div>
        </div>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedTags={selectedCategory ? [selectedCategory] : []}
          onTagsChange={(tags) => setSelectedCategory(tags[0] || null)}
          availableTags={categories}
        />

            {pins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground mb-4 text-lg">Aún no hay creaciones</p>
                <p className="text-sm text-muted-foreground/70">
                  Sé el primero en compartir tu trabajo. Haz clic en el botón Crear para subir tu primer pin.
                </p>
              </div>
            ) : filteredPins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-muted-foreground mb-4 text-lg">No se encontraron pins</p>
                <p className="text-sm text-muted-foreground/70">
                  Intenta ajustar tu búsqueda o criterios de filtro.
                </p>
              </div>
            ) : (
              <>
                <MasonryFeed 
                  pins={filteredPins} 
                  users={users}
                  onRefresh={async () => {
                    const allPins = await getAllPins()
                    setPins(allPins)
                    setRefreshKey(prev => prev + 1)
                  }}
                />
                {filteredPins.length < pins.length && (
                  <p className="text-center text-sm text-muted-foreground mt-8">
                    Mostrando {filteredPins.length} de {pins.length} pins
                  </p>
                )}
              </>
            )}
      </main>
    </div>
  )
}

