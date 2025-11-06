import { useState, useRef, useEffect } from "react"

interface ImageCardProps {
  image: {
    id: string
    title: string
    url: string
    tags: string[]
  }
}

export function ImageCard({ image }: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "50px" },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  const handleClick = () => {
    console.log(`[Gallery] Image clicked: ${image.title}`)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="group relative overflow-hidden rounded-lg bg-muted/50 cursor-pointer aspect-square transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted/30 animate-pulse" />
      )}

      {isInView && (
        <img
          src={image.url || "/placeholder.svg"}
          alt={image.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
        <h3 className="font-semibold text-sm text-white line-clamp-2 mb-3">{image.title}</h3>

        {image.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {image.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-primary/70 text-primary-foreground backdrop-blur-sm transition-colors group-hover:bg-primary/90"
              >
                {tag}
              </span>
            ))}
            {image.tags.length > 2 && (
              <span className="inline-block px-2.5 py-1 text-xs font-medium text-white/80">
                +{image.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
