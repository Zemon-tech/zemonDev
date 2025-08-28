import { cn } from "@/lib/utils"

interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: string[]
  size?: 'sm' | 'md' | 'lg'
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
  size = 'md',
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
  const sizeToPx: Record<string, string> = { sm: 'h-6 w-6', md: 'h-8 w-8', lg: 'h-10 w-10' };
  const sizePx = sizeToPx[size] || sizeToPx.md;
  const borderSize = size === 'sm' ? 'border' : 'border-2';

  // If nothing to show, render null
  if (validAvatarUrls.length === 0 && (!numPeople || numPeople <= 0)) return null;
  
  return (
    <div className={cn("z-10 flex -space-x-2 rtl:space-x-reverse", className)}>
      {validAvatarUrls.map((url, index) => (
        <img
          key={index}
          className={cn(`${sizePx} rounded-full ${borderSize} border-white dark:border-gray-800`)}
          src={url}
          width={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : 40}
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
        <div
          className={cn(
            `flex ${sizePx} items-center justify-center rounded-full ${borderSize} 
             border-base-300 bg-base-200 text-center text-[10px] font-medium text-base-content/80 
             dark:border-base-600 dark:bg-base-700 dark:text-base-content`
          )}
        >
          +{numPeople}
        </div>
      )}
    </div>
  )
}

export { AvatarCircles }
