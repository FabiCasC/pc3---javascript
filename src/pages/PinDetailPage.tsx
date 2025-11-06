import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { getPinById, getUserById, updatePinLikes, setUserLike, isPinLikedByUser } from "@/lib/db"
import type { Pin, User } from "@/lib/db"
import { AppHeader } from "@/components/AppHeader"
import { CommentSection } from "@/components/CommentSection"
import { SaveToCollection } from "@/components/SaveToCollection"
import { getCurrentUser, isLoggedIn, clearCurrentUser } from "@/lib/auth"

export default function PinDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const pinId = params.pinId as string

  const [pin, setPin] = useState<Pin | null>(null)
  const [creator, setCreator] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const current = await getCurrentUser()
      setCurrentUser(current)
    }
    loadUser()

    const loadPin = async () => {
      const foundPin = await getPinById(pinId)
      if (foundPin) {
        setPin(foundPin)
        setLikes(foundPin.likes)
        setIsLiked(isPinLikedByUser(pinId))
        const user = await getUserById(foundPin.userId)
        setCreator(user)
      }
      setIsLoading(false)
    }

    loadPin()
  }, [pinId])

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader 
        currentUser={currentUser} 
        onLogout={() => {
          clearCurrentUser()
          navigate("/")
        }} 
      />
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!pin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader 
        currentUser={currentUser} 
        onLogout={() => {
          clearCurrentUser()
          navigate("/")
        }} 
      />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Pin no encontrado</p>
          <Link to="/" className="text-primary hover:underline">
            Volver a la galería
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = async () => {
    if (!pin || !currentUser) return
    
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikes(newLikedState ? likes + 1 : Math.max(0, likes - 1))
    
    // Persist to database
    await updatePinLikes(pin.id, newLikedState, currentUser.id)
    setUserLike(pin.id, newLikedState)
    
    // Reload pin to get updated data
    const updatedPin = await getPinById(pin.id)
    if (updatedPin) {
      setPin(updatedPin)
      setLikes(updatedPin.likes)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        currentUser={currentUser} 
        onLogout={() => {
          clearCurrentUser()
          navigate("/")
        }} 
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-primary hover:text-primary/80 mb-8 flex items-center gap-2 transition-colors"
        >
          <span>←</span> Atrás
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img
              src={pin.image || "/placeholder.svg"}
              alt={pin.title}
              className="w-full rounded-2xl object-cover max-h-[600px]"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{pin.title}</h1>
              <p className="text-muted-foreground text-lg">{pin.description}</p>

              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                  {pin.category
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </span>
              </div>
            </div>

            {creator && (
              <div className="pt-6 border-t border-border/40">
                <p className="text-sm text-muted-foreground mb-3">Created by</p>
                <Link
                  to={`/profile/${creator.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={creator.avatar || "/placeholder.svg"}
                    alt={creator.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{creator.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{creator.username}</p>
                  </div>
                </Link>
              </div>
            )}

            <div className="pt-6 border-t border-border/40 flex gap-3">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors flex-1 justify-center ${
                  isLiked ? "bg-primary text-primary-foreground" : "bg-border text-foreground hover:bg-border/80"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {likes}
              </button>

              <SaveToCollection pinId={pinId} />

              <button
                type="button"
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard.writeText(url)
                  alert("¡Enlace copiado al portapapeles!")
                }}
                className="px-4 py-2 rounded-full font-medium transition-colors bg-border text-foreground hover:bg-border/80"
                title="Compartir"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!pin) return
                  const link = document.createElement('a')
                  link.href = pin.image
                  link.download = `${pin.title.replace(/\s+/g, '-')}.jpg`
                  link.target = '_blank'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 rounded-full font-medium transition-colors bg-border text-foreground hover:bg-border/80"
                title="Descargar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>

            <div className="pt-6 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                {new Date(pin.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <CommentSection pinId={pinId} />
          </div>
        </div>
      </div>
    </div>
  )
}

