import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { updateUserProfile } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/auth"
import { Edit2, User as UserIcon } from "lucide-react"

interface EditProfileModalProps {
  onUpdate?: () => void
}

export function EditProfileModal({ onUpdate }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    bio: "",
    avatar: "",
  })

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || "",
      })
      setError("")
    }
  }, [isOpen, currentUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setIsLoading(true)
    setError("")

    try {
      // Validate username
      if (!formData.username.trim()) {
        setError("El nombre de usuario es requerido")
        setIsLoading(false)
        return
      }

      if (formData.username.length < 3) {
        setError("El nombre de usuario debe tener al menos 3 caracteres")
        setIsLoading(false)
        return
      }

      // Validate display name
      if (!formData.displayName.trim()) {
        setError("El nombre completo es requerido")
        setIsLoading(false)
        return
      }

      console.log("Updating user profile...")
      const updatedUser = await updateUserProfile(currentUser.id, {
        displayName: formData.displayName.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim() || currentUser.avatar,
      })
      console.log("Profile updated:", updatedUser)

      if (updatedUser) {
        // User updated, state will be refreshed on next render
        setIsOpen(false)
        onUpdate?.()
      } else {
        setError("Error al actualizar el perfil")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Edit2 className="w-4 h-4" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center overflow-hidden">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={formData.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <UserIcon className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            <Input
              name="avatar"
              type="url"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="URL de la imagen de perfil"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-foreground mb-2">
              Nombre Completo
            </label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2">
              Nombre de Usuario
            </label>
            <div className="flex items-center">
              <span className="text-muted-foreground px-3 py-2 bg-muted/50 rounded-l-lg border border-r-0 border-border font-semibold">
                @
              </span>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="usuario"
                className="rounded-l-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-foreground mb-2">
              Biografía
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

