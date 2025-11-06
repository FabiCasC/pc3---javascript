import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getUserCollections, createCollection, addPinToCollection, removePinFromCollection } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import type { Collection, User } from "@/lib/db"
import { Bookmark, Plus, X } from "lucide-react"

interface SaveToCollectionProps {
  pinId: string
}

export function SaveToCollection({ pinId }: SaveToCollectionProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDesc, setNewCollectionDesc] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCollections()
    }
  }, [isOpen, currentUser])

  const loadCollections = async () => {
    if (!currentUser) return
    const userCollections = await getUserCollections(currentUser.id)
    setCollections(userCollections)
  }

  const handleCreateCollection = async () => {
    if (!currentUser || !newCollectionName.trim() || isCreating) return
    setIsCreating(true)
    try {
      console.log("Creating collection...")
      const newCollection = await createCollection(currentUser.id, newCollectionName.trim(), newCollectionDesc.trim())
      console.log("Collection created, adding pin...")
      await addPinToCollection(newCollection.id, pinId)
      console.log("Pin added, reloading...")
      await loadCollections()
      setNewCollectionName("")
      setNewCollectionDesc("")
      console.log("Done!")
    } catch (error) {
      console.error("Error creating collection:", error)
      alert("Error al crear la colección. Por favor intenta de nuevo.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleTogglePin = async (collectionId: string, isInCollection: boolean) => {
    try {
      console.log("Toggling pin...", { collectionId, isInCollection })
      if (isInCollection) {
        await removePinFromCollection(collectionId, pinId)
      } else {
        await addPinToCollection(collectionId, pinId)
      }
      console.log("Pin toggled, reloading...")
      await loadCollections()
      console.log("Done!")
    } catch (error) {
      console.error("Error toggling pin:", error)
      alert("Error al guardar. Por favor intenta de nuevo.")
    }
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="px-4 py-2 rounded-full font-medium"
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Guardar en colección</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create new collection */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Nueva colección</h3>
            </div>
            <Input
              placeholder="Nombre de la colección"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="w-full"
            />
            <Textarea
              placeholder="Descripción (opcional)"
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              rows={2}
              className="w-full resize-none"
            />
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCreateCollection()
              }}
              disabled={!newCollectionName.trim() || isCreating}
              className="w-full"
              size="sm"
            >
              {isCreating ? "Creando..." : "Crear y guardar"}
            </Button>
          </div>

          {/* Existing collections */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-sm text-muted-foreground">Tus colecciones</h3>
            {collections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aún no tienes colecciones
              </p>
            ) : (
              collections.map((collection) => {
                const isInCollection = collection.pinIds.includes(pinId)
                return (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {collection.name}
                      </p>
                      {collection.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {collection.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {collection.pinIds.length} pin{collection.pinIds.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTogglePin(collection.id, isInCollection)
                      }}
                      variant={isInCollection ? "default" : "outline"}
                      size="sm"
                      className="ml-2"
                      disabled={isCreating}
                    >
                      {isInCollection ? (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Quitar
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3 h-3 mr-1" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

