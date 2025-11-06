import { UserNav } from "./UserNav"
import { ThemeToggle } from "./ThemeToggle"
import { NotificationBell } from "./NotificationBell"
import type { User } from "@/lib/auth"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { UploadModal } from "./UploadModal"
import { Button } from "@/components/ui/button"
import { addPin } from "@/lib/db"
import type { Pin } from "@/lib/db"

interface AppHeaderProps {
  currentUser: User | null
  onLogout: () => void
  onPinCreated?: () => void
}

export function AppHeader({ currentUser, onLogout, onPinCreated }: AppHeaderProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isProfile = location.pathname === "/my-profile"

  const handleUpload = async (pinData: Omit<Pin, "id" | "createdAt" | "likes">) => {
    try {
      setIsUploading(true)
      await addPin(pinData)
      console.log("[v0] Pin uploaded successfully by", currentUser?.username)
      setIsUploadOpen(false)
      onPinCreated?.()
    } catch (error) {
      console.error("[v0] Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                CREAZA
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {currentUser ? (
                <>
                  <NotificationBell />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsUploadOpen(true)
                    }}
                    className="bg-primary hover:opacity-90 text-primary-foreground"
                    disabled={isUploading}
                  >
                    + Crear
                  </Button>
                  <UserNav user={currentUser} onLogout={onLogout} />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    asChild={true}
                    className="text-sm"
                  >
                    <Link to="/signup">
                      Crear Cuenta
                    </Link>
                  </Button>
                  <Button
                    asChild={true}
                    className="bg-primary hover:opacity-90 text-primary-foreground text-sm"
                  >
                    <Link to="/login">
                      Iniciar Sesión
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 border-b border-border/40">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                isHome
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Inicio
            </Link>
            {currentUser && (
              <Link
                to="/my-profile"
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  isProfile
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Mi Perfil
              </Link>
            )}
          </div>
        </div>
      </header>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        userId={currentUser?.id || ""}
      />
    </>
  )
}
