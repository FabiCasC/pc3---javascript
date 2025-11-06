import { ImageCard } from "./ImageCard"

interface Image {
  id: string
  title: string
  url: string
  tags: string[]
}

interface ImageGalleryProps {
  images: Image[]
  searchTerm: string
}

export function ImageGallery({ images, searchTerm }: ImageGalleryProps) {
  return (
    <div className="mt-8">
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-center space-y-4">
            <p className="text-xl text-muted-foreground">No images found for "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground/70">
              Try searching with different keywords or browse all images by clearing the search.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-max">
            {images.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Showing {images.length} {images.length === 1 ? "image" : "images"}
          </p>
        </>
      )}
    </div>
  )
}
