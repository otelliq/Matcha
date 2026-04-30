import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex-shrink-0 shadow-md', sizeMap[size], className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />
    </div>
  )
}
