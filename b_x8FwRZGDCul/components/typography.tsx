import React from 'react'
import { cn } from '@/lib/utils'

export function H1({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn('text-5xl md:text-6xl font-extrabold tracking-tight', className)}>
      {children}
    </h1>
  )
}

export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-4xl md:text-5xl font-bold tracking-tight', className)}>
      {children}
    </h2>
  )
}

export function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-2xl md:text-3xl font-bold', className)}>
      {children}
    </h3>
  )
}

export function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-base md:text-lg leading-relaxed', className)}>
      {children}
    </p>
  )
}

export function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('text-sm font-semibold text-foreground block mb-2', className)}>
      {children}
    </label>
  )
}
