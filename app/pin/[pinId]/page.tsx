"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDatabase, getUserById } from "@/lib/db"
import type { Pin, User } from "@/lib/db"
import { AppHeader } from "@/components/AppHeader"
import { getCurrentUser, isLoggedIn } from "@/lib/auth"
import Link from "next/link"

export default function PinDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pinId = params.pinId as string

  const [pin, setPin] = useState<Pin | null>(null)
  const [creator, setCreator] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const current = getCurrentUser()
    setCurrentUser(current)

    getDatabase().then((db) => {
      const foundPin = db.pins?.find((p: Pin) => p.id === pinId)
      if (foundPin) {
        setPin(foundPin)
        setLikes(foundPin.likes)
        getUserById(foundPin.userId).then((user) => {
          setCreator(user)
        })
      }
      setIsLoading(false)
    })
  }, [pinId])

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
          </div>
        </div>
      </div>
    )
  }

  if (!pin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader currentUser={currentUser} onLogout={() => router.push("/")} />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">Pin not found</p>
          <Link href="/" className="text-primary hover:underline">
            Return to gallery
          </Link>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader currentUser={currentUser} onLogout={() => router.push("/")} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="text-primary hover:text-primary/80 mb-8 flex items-center gap-2 transition-colors"
        >
          <span>←</span> Back
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
                  href={`/profile/${creator.id}`}
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
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors flex-1 justify-center ${
                  isLiked ? "bg-red-500 text-white" : "bg-border text-foreground hover:bg-border/80"
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

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex-1 px-4 py-2 rounded-full font-medium transition-colors ${
                  isSaved
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-border text-foreground hover:bg-border/80"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
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
          </div>
        </div>
      </div>
    </div>
  )
}
