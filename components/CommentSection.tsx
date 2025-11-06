import { useState, useEffect } from "react"
import { getPinComments, addComment, getUserById } from "@/lib/db"
import type { Comment, User } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentSectionProps {
  pinId: string
}

export function CommentSection({ pinId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    loadComments()
  }, [pinId])

  const loadComments = async () => {
    const fetchedComments = await getPinComments(pinId)
    setComments(fetchedComments)

    // Load user data for all comments
    const userIds = [...new Set(fetchedComments.map((c) => c.userId))]
    const userMap: Record<string, User> = {}
    for (const userId of userIds) {
      const user = await getUserById(userId)
      if (user) userMap[userId] = user
    }
    setUsers(userMap)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      await addComment({
        pinId,
        userId: currentUser.id,
        text: newComment.trim(),
      })
      setNewComment("")
      loadComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-6 border-t border-border/40">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Comentarios ({comments.length})
      </h3>

      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar || "/placeholder.svg"}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Agregar un comentario..."
                className="min-h-[80px] resize-none"
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="mt-2"
                size="sm"
              >
                {isSubmitting ? "Publicando..." : "Publicar Comentario"}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aún no hay comentarios. ¡Sé el primero en comentar!</p>
        ) : (
          comments.map((comment) => {
            const user = users[comment.userId]
            return (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.displayName || "User"}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {user?.displayName || "Desconocido"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{user?.username || "desconocido"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.text}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

