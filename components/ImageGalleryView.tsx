import { useState } from "react"
import { Link } from "react-router-dom"

interface GalleryImage {
  id: string
  src: string
  title: string
  category: string
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: "gallery-1",
    src: "/abstract-art-colors-geometric.jpg",
    title: "Abstract Geometric Art",
    category: "Illustration",
  },
  {
    id: "gallery-2",
    src: "/city-skyline-urban-buildings.jpg",
    title: "City Skyline",
    category: "Design",
  },
  {
    id: "gallery-3",
    src: "/desert-sand-dunes-landscape.jpg",
    title: "Desert Landscape",
    category: "Photography",
  },
  {
    id: "gallery-4",
    src: "/flowers-garden-floral-nature.jpg",
    title: "Floral Garden",
    category: "Photography",
  },
  {
    id: "gallery-5",
    src: "/forest-path-trees-green.jpg",
    title: "Forest Path",
    category: "Concept Art",
  },
  {
    id: "gallery-6",
    src: "/modern-architecture-building-design.jpg",
    title: "Modern Architecture",
    category: "Design",
  },
  {
    id: "gallery-7",
    src: "/ocean-waves-sea-beach.jpg",
    title: "Ocean Waves",
    category: "Photography",
  },
  {
    id: "gallery-8",
    src: "/serene-mountain-landscape.png",
    title: "Mountain Landscape",
    category: "Illustration",
  },
  {
    id: "gallery-9",
    src: "/sunset-sky-orange-colors.jpg",
    title: "Sunset Sky",
    category: "Photography",
  },
  {
    id: "gallery-10",
    src: "/urban-street-photography.png",
    title: "Urban Street",
    category: "Photography",
  },
]

export function ImageGalleryView() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Image Gallery</h2>
        <p className="text-muted-foreground">
          Browse through our collection of beautiful images and artwork
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {GALLERY_IMAGES.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg bg-card cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h3 className="text-white font-semibold text-sm mb-1">{image.title}</h3>
              <span className="text-white/80 text-xs">{image.category}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-card/80 hover:bg-card text-foreground rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-foreground font-bold text-lg mb-1">{selectedImage.title}</h3>
              <span className="text-muted-foreground text-sm">{selectedImage.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

