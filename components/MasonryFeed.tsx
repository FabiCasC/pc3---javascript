import { useMemo, useCallback } from "react"
import type { Pin, User } from "@/lib/db"
import { PinCard } from "./PinCard"

interface MasonryFeedProps {
  pins: Pin[]
  users: User[]
  onRefresh?: () => void
}

export function MasonryFeed({ pins, users, onRefresh }: MasonryFeedProps) {
  const getUserById = useCallback((userId: string) => {
    return users.find((u) => u.id === userId)
  }, [users])

  const handleLikeUpdate = useCallback(() => {
    // Just call the refresh callback, don't reload everything
    onRefresh?.()
  }, [onRefresh])

  // Memoize user map for better performance
  const userMap = useMemo(() => {
    const map: Record<string, User> = {}
    users.forEach(user => {
      map[user.id] = user
    })
    return map
  }, [users])

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 px-4 py-8">
      {pins.map((pin) => {
        const creator = userMap[pin.userId]
        return (
          <div key={pin.id} className="break-inside-avoid mb-4">
            <PinCard pin={pin} creator={creator} onLikeUpdate={handleLikeUpdate} />
          </div>
        )
      })}
    </div>
  )
}
