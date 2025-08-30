import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  ring?: boolean
  ringColor?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = 'md', status, ring = false, ringColor, ...props }, ref) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          ring && "ring-2 ring-offset-2",
          ring && ringColor ? `ring-${ringColor}` : ring && "ring-primary",
          className
        )}
        {...props}
      />
      {status && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800",
          statusColors[status]
        )} />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  fallback?: string
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, fallback, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  delayMs?: number
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, delayMs = 600, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    delayMs={delayMs}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Convenience component for profile avatars
interface ProfileAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  ring?: boolean
  ringColor?: string
  className?: string
}

const ProfileAvatar = React.forwardRef<HTMLDivElement, ProfileAvatarProps>(
  ({ src, alt, fallback, size = 'md', status, ring = false, ringColor, className }, ref) => {
    // Generate fallback initials from alt text or fallback prop
    const getInitials = () => {
      if (fallback) return fallback
      if (alt) {
        return alt
          .split(' ')
          .map(name => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
      return 'U'
    }

    return (
      <Avatar size={size} status={status} ring={ring} ringColor={ringColor} className={className} ref={ref}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
    )
  }
)
ProfileAvatar.displayName = "ProfileAvatar"

// Scrollable Avatar Selector Component with fixed dimensions
interface ScrollableAvatarSelectorProps {
  avatars: Array<{
    id: string
    src: string
    alt: string
  }>
  selectedAvatar?: string
  onAvatarSelect: (avatarId: string) => void
  maxVisible?: number
  className?: string
  gridCols?: number
  avatarSize?: 'sm' | 'md' | 'lg'
}

const ScrollableAvatarSelector = React.forwardRef<
  HTMLDivElement,
  ScrollableAvatarSelectorProps
>(({ 
  avatars, 
  selectedAvatar, 
  onAvatarSelect, 
  maxVisible = 12, 
  className,
  gridCols = 6,
  avatarSize = 'md'
}, ref) => {
  const [showAll, setShowAll] = React.useState(false)
  const hasMoreAvatars = avatars.length > maxVisible

  const visibleAvatars = showAll ? avatars : avatars.slice(0, maxVisible)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  return (
    <div ref={ref} className={cn("space-y-3", className)}>
      {/* Fixed height container for consistent dimensions */}
      <div className={cn(
        "grid gap-2 overflow-hidden transition-all duration-300",
        `grid-cols-${gridCols}`,
        showAll ? "max-h-none" : "max-h-48"
      )}>
        {visibleAvatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onAvatarSelect(avatar.id)}
            className={cn(
              "relative flex shrink-0 overflow-hidden rounded-full transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              sizeClasses[avatarSize],
              selectedAvatar === avatar.id
                ? "ring-2 ring-primary ring-offset-2 shadow-lg"
                : "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:shadow-md"
            )}
          >
            <AvatarImage src={avatar.src} alt={avatar.alt} />
            <AvatarFallback>
              {avatar.alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </button>
        ))}
      </div>
      
      {/* Scroll down/up button */}
      {hasMoreAvatars && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 hover:shadow-sm"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show More ({avatars.length - maxVisible} more)
            </>
          )}
        </button>
      )}
    </div>
  )
})
ScrollableAvatarSelector.displayName = "ScrollableAvatarSelector"

// Category-based Avatar Selector with tabs
interface AvatarCategory {
  id: string
  name: string
  description: string
  avatars: Array<{
    id: string
    src: string
    alt: string
  }>
}

interface CategoryAvatarSelectorProps {
  categories: AvatarCategory[]
  selectedAvatar?: string
  onAvatarSelect: (avatarId: string) => void
  className?: string
  maxVisiblePerCategory?: number
  gridCols?: number
  avatarSize?: 'sm' | 'md' | 'lg'
}

const CategoryAvatarSelector = React.forwardRef<
  HTMLDivElement,
  CategoryAvatarSelectorProps
>(({ 
  categories, 
  selectedAvatar, 
  onAvatarSelect, 
  className,
  maxVisiblePerCategory = 12,
  gridCols = 6,
  avatarSize = 'md'
}, ref) => {
  const [activeCategory, setActiveCategory] = React.useState(categories[0]?.id || '')

  const activeCategoryData = categories.find(cat => cat.id === activeCategory)

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-base-200 dark:border-base-700 pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
              activeCategory === category.id
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/70 hover:text-base-content hover:bg-base-200/50 dark:hover:bg-base-700/50"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Category Description */}
      {activeCategoryData && (
        <div className="text-xs text-base-content/60 dark:text-base-content/50 px-1">
          {activeCategoryData.description}
        </div>
      )}

      {/* Avatar Grid for Active Category */}
      {activeCategoryData && (
        <ScrollableAvatarSelector
          avatars={activeCategoryData.avatars}
          selectedAvatar={selectedAvatar}
          onAvatarSelect={onAvatarSelect}
          maxVisible={maxVisiblePerCategory}
          gridCols={gridCols}
          avatarSize={avatarSize}
        />
      )}
    </div>
  )
})
CategoryAvatarSelector.displayName = "CategoryAvatarSelector"

export { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  ProfileAvatar, 
  ScrollableAvatarSelector,
  CategoryAvatarSelector
}
export type { 
  AvatarProps, 
  AvatarImageProps, 
  AvatarFallbackProps, 
  ProfileAvatarProps,
  ScrollableAvatarSelectorProps,
  CategoryAvatarSelectorProps,
  AvatarCategory
} 