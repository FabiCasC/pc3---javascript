import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Pin } from "@/lib/db"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (pin: Omit<Pin, "id" | "createdAt" | "likes">) => void
  userId: string
}

export function UploadModal({ isOpen, onClose, onUpload, userId }: UploadModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"illustration" | "design" | "photography" | "concept-art" | "drawing">(
    "design",
  )
  const [tags, setTags] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setImageUrl("")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    if (url) {
      setPreview(url)
      setImageFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !preview) {
      alert("Por favor completa todos los campos y proporciona una imagen")
      return
    }

    setIsSubmitting(true)

    try {
      // Parse tags from comma-separated string
      const tagsArray = tags
        .split(",")
        .map(tag => tag.trim().replace(/^#/, "")) // Remove # if present
        .filter(tag => tag.length > 0)

      const newPin: Omit<Pin, "id" | "createdAt" | "likes"> = {
        userId,
        title: title.trim(),
        description: description.trim(),
        image: preview,
        category,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      }

      await onUpload(newPin)

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("design")
      setTags("")
      setImageUrl("")
      setImageFile(null)
      setPreview("")
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert("Error al subir. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Imagen</label>
            {preview ? (
              <div className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full rounded-lg max-h-96 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview("")
                    setImageFile(null)
                    setImageUrl("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2">
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                <div className="text-center text-sm text-muted-foreground">Or paste image URL:</div>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Dale un nombre a tu creación"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos sobre tu creación..."
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="illustration">Illustration</option>
              <option value="design">Design</option>
              <option value="photography">Photography</option>
              <option value="concept-art">Concept Art</option>
              <option value="drawing">Drawing</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (Hashtags)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="arte, diseño, creatividad (separados por comas)"
            />
            <p className="text-xs text-muted-foreground">
              Separa los tags con comas. Ejemplo: arte, diseño, creatividad
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !preview}>
              {isSubmitting ? "Subiendo..." : "Crear Pin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
