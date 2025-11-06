import { type User, clearCurrentUser } from "@/lib/auth"
import { Link } from "react-router-dom"
import { useState } from "react"
import { User as UserIcon, LogOut, RefreshCw, Eye } from "lucide-react"

interface UserNavProps {
  user: User
  onLogout: () => void
}

export function UserNav({ user, onLogout }: UserNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      setIsMenuOpen(false)
      await clearCurrentUser()
      localStorage.removeItem("creaza_user_likes")
      onLogout()
      // Force reload to ensure clean state
      window.location.href = "/"
    } catch (error) {
      console.error("Error logging out:", error)
      // Force clear everything as fallback
      localStorage.removeItem("creaza_current_user")
      localStorage.removeItem("creaza_user_likes")
      window.location.href = "/"
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsMenuOpen(!isMenuOpen)
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors"
      >
        <img
          src={user.avatar || "/placeholder-user.jpg"}
          alt={user.displayName}
          className="w-8 h-8 rounded-full object-cover border-2 border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder-user.jpg"
          }}
        />
        <span className="text-sm font-medium hidden sm:inline text-foreground">{user.displayName || user.username}</span>
      </button>

      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-[100] min-w-[200px]">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{user.displayName || user.username}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <Link
              to="/my-profile"
              className="flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors text-sm font-medium text-foreground border-b border-border/50"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="w-4 h-4" />
              Mi Perfil
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-muted transition-colors text-sm font-medium text-foreground border-b border-border/50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Eye className="w-4 h-4" />
              Ver Perfil Público
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleLogout(e)
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm font-medium text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                localStorage.clear()
                window.location.reload()
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-muted transition-colors text-xs font-medium text-destructive/70 border-t border-border/50"
              title="Limpiar todo (emergencia)"
            >
              <RefreshCw className="w-3 h-3" />
              Limpiar Todo
            </button>
          </div>
        </>
      )}
    </div>
  )
}
