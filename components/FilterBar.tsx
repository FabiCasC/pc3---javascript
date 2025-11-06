import { useRef } from "react"

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags: string[]
}

export function FilterBar({ searchTerm, onSearchChange, selectedTags, onTagsChange, availableTags }: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onSearchChange("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearTags = () => {
    onTagsChange([])
  }

  return (
    <div className="w-full mb-8 space-y-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar por título o categoría..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-4 pr-12 rounded-lg border border-border/50 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground/70">
        {searchTerm ? `Filtrando por: "${searchTerm}"` : "Busca en todos los títulos y categorías"}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Filtrar por categoría:</label>
          {selectedTags.length > 0 && (
            <button type="button" onClick={clearTags} className="text-xs text-primary hover:text-primary/80 transition-colors">
              Limpiar todo
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all border ${
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-border/50 hover:border-border"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
