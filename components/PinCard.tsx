import type React from "react"

import type { Pin } from "@/lib/db"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { updatePinLikes, setUserLike, isPinLikedByUser } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

interface PinCardProps {
  pin: Pin
  creator?: { displayName: string; avatar: string }
  onLikeUpdate?: () => void
}

export function PinCard({ pin, creator, onLikeUpdate }: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [likes, setLikes] = useState(pin.likes)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    setLikes(pin.likes)
    setIsLiked(isPinLikedByUser(pin.id))
  }, [pin.id, pin.likes])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const currentUser = await getCurrentUser()
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikes(newLikedState ? likes + 1 : Math.max(0, likes - 1))
    
    // Persist to database
    await updatePinLikes(pin.id, newLikedState, currentUser?.id)
    setUserLike(pin.id, newLikedState)
    onLikeUpdate?.()
  }

  return (
    <Link to={`/pin/${pin.id}`}>
      <div
        className="rounded-2xl overflow-hidden bg-card cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={pin.image || "/placeholder.svg"}
            alt={pin.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 transition-opacity duration-200 pointer-events-none">
              <div></div>
              <div className="flex justify-between items-end pointer-events-auto">
                {creator && (
                  <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-2">
                    <img
                      src={creator.avatar || "/placeholder.svg"}
                      alt={creator.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-card-foreground">{creator.displayName}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleLike}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`rounded-full p-2 backdrop-blur-md transition-all relative z-10 ${
                    isLiked ? "bg-primary text-primary-foreground" : "bg-card/70 hover:bg-card text-card-foreground"
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
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 bg-card">
          <h3 className="font-bold text-card-foreground line-clamp-2 text-sm">{pin.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground capitalize">{pin.category}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
