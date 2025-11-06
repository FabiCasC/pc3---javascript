import { useState } from "react"
import { LoginModal } from "@/components/LoginModal"
import { SignUpModal } from "@/components/SignUpModal"

type AuthView = "welcome" | "login" | "signup"

interface AuthPageProps {
  onAuthSuccess: () => void
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [view, setView] = useState<AuthView>("welcome")

  if (view === "login") {
    return <LoginModal onLoginSuccess={onAuthSuccess} onBackClick={() => setView("welcome")} />
  }

  if (view === "signup") {
    return <SignUpModal onSignUpSuccess={onAuthSuccess} onBackClick={() => setView("welcome")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <span className="text-4xl font-bold text-primary-foreground">C</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-3 tracking-tight">
              CREAZA
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Descubre y comparte tu trabajo creativo
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              type="button"
              onClick={() => setView("login")}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold text-base rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>

            <button
              type="button"
              onClick={() => setView("signup")}
              className="w-full py-4 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-border/50"
            >
              Crear Cuenta
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Únete a miles de artistas compartiendo inspiración en todo el mundo.
          </p>
        </div>
      </div>
    </div>
  )
}
