import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { signUpWithEmail } from "@/lib/auth"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    bio: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.displayName.trim()) {
      setError("El nombre es requerido")
      setIsLoading(false)
      return
    }
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
    if (!formData.email.includes("@")) {
      setError("Se requiere un correo electrónico válido")
      setIsLoading(false)
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      await signUpWithEmail(formData.email, formData.password, {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
      })
      // Redirigir al home después del registro exitoso
      navigate("/")
      // Recargar para actualizar el estado
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
          <Link
            to="/"
            className="mb-6 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors font-medium hover:gap-3 inline-block"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>

          <div className="text-center mb-8">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
              Crear Cuenta
            </div>
            <p className="text-muted-foreground font-medium">Únete a CREAZA y comienza a compartir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-foreground mb-2.5">
                Nombre Completo
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3.5 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2.5">
                Nombre de Usuario
              </label>
              <div className="flex items-center">
                <span className="text-muted-foreground px-4 py-3.5 bg-muted/50 rounded-l-xl border border-r-0 border-border font-semibold">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="usuario"
                  className="flex-1 px-4 py-3.5 bg-input/50 border border-border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2.5">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@ejemplo.com"
                className="w-full px-4 py-3.5 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-foreground transition-all placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-foreground mb-2.5">
                Biografía (Opcional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
                className="w-full px-4 py-3.5 bg-input/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none text-foreground transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

