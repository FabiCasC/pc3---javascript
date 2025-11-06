import { Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getUnreadNotificationsCount, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getPinById, getUserById } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { Notification, Pin, User } from "@/lib/db"
import { Link } from "react-router-dom"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pins, setPins] = useState<Record<string, Pin>>({})
  const [users, setUsers] = useState<Record<string, User>>({})
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    if (!currentUser) return
    
    let cancelled = false

    const loadNotifications = async () => {
      if (cancelled) return
      
      try {
        const notifs = await getUserNotifications(currentUser.id)
        const count = await getUnreadNotificationsCount(currentUser.id)
        
        if (cancelled) return
        
        setNotifications(notifs)
        setUnreadCount(count)

        // Only load pins and users if modal is open
        if (isOpen && notifs.length > 0) {
          const pinIds = [...new Set(notifs.filter(n => n.pinId).map(n => n.pinId!))]
          const userIds = [...new Set(notifs.map(n => n.fromUserId))]

          const pinMap: Record<string, Pin> = {}
          for (const pinId of pinIds) {
            const pin = await getPinById(pinId)
            if (pin) pinMap[pinId] = pin
          }

          const userMap: Record<string, User> = {}
          for (const userId of userIds) {
            if (cancelled) return
            const user = await getUserById(userId)
            if (user) userMap[userId] = user
          }

          if (!cancelled) {
            setPins(pinMap)
            setUsers(userMap)
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading notifications:", error)
        }
      }
    }

    loadNotifications()
    // Only update when modal is open, otherwise check every 60 seconds
    const interval = isOpen ? setInterval(() => {
      if (!cancelled) loadNotifications()
    }, 15000) : setInterval(() => {
      if (!cancelled) loadNotifications()
    }, 60000)
    
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [currentUser?.id, isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return
    await markAllNotificationsAsRead(currentUser.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  if (!currentUser) return null

  const getNotificationMessage = (notif: Notification): string => {
    const user = users[notif.fromUserId]
    const userName = user?.displayName || "Alguien"
    
    switch (notif.type) {
      case "like":
        return `${userName} le dio me gusta a tu pin`
      case "comment":
        return `${userName} comentó en tu pin`
      case "follow":
        return `${userName} empezó a seguirte`
      default:
        return "Nueva notificación"
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-9 h-9 relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-full text-xs text-primary-foreground flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleMarkAllAsRead()
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No hay notificaciones
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notif) => {
                    const pin = notif.pinId ? pins[notif.pinId] : null
                    const user = users[notif.fromUserId]
                    
                    return (
                      <Link
                        key={notif.id}
                        to={pin ? `/pin/${pin.id}` : `/profile/${notif.fromUserId}`}
                        onClick={() => {
                          if (!notif.read) handleMarkAsRead(notif.id)
                          setIsOpen(false)
                        }}
                        className={`block p-4 hover:bg-muted/50 transition-colors ${
                          !notif.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={user?.avatar || "/placeholder-user.jpg"}
                            alt={user?.displayName}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                              {getNotificationMessage(notif)}
                            </p>
                            {pin && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {pin.title}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.createdAt).toLocaleDateString("es", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

