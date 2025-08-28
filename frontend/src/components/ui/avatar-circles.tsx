import { cn } from "@/lib/utils"

interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: string[]
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('AvatarCircles props:', { numPeople, className, avatarUrls });
  }
  
  // Validate props
  if (!Array.isArray(avatarUrls)) {
    console.warn('AvatarCircles: avatarUrls is not an array:', avatarUrls);
    return null;
  }
  
  // Filter out empty or invalid URLs
  const validAvatarUrls = avatarUrls.filter(url => url && typeof url === 'string' && url.trim() !== '');
  
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {validAvatarUrls.map((url, index) => (
        <img
          key={index}
          className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
          onError={(e) => {
            if (import.meta.env.DEV) {
              console.warn(`Avatar image failed to load: ${url}`);
            }
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ))}
      {typeof numPeople === 'number' && numPeople > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href=""
        >
          +{numPeople}
        </a>
      )}
      {/* Fallback display for debugging */}
      {import.meta.env.DEV && validAvatarUrls.length === 0 && (
        <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
          No avatars
        </div>
      )}
    </div>
  )
}

export { AvatarCircles }
