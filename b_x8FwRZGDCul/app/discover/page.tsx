'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { Button } from '@/components/button'
import { Avatar } from '@/components/avatar'
import { Card, CardContent } from '@/components/card'
import { H3, Body, Caption } from '@/components/typography'

gsap.registerPlugin(Draggable)

const profiles = [
  {
    id: 1,
    name: 'Sophie',
    age: 26,
    location: 'Los Angeles, CA',
    bio: 'Adventurous traveler, coffee enthusiast, love hiking',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop',
    interests: ['Travel', 'Photography', 'Yoga'],
  },
  {
    id: 2,
    name: 'Emma',
    age: 24,
    location: 'San Francisco, CA',
    bio: 'Artist & designer, love good conversations',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop',
    interests: ['Art', 'Music', 'Cooking'],
  },
  {
    id: 3,
    name: 'Olivia',
    age: 27,
    location: 'New York, NY',
    bio: 'Book lover, fitness enthusiast, dog mom',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop',
    interests: ['Reading', 'Fitness', 'Nature'],
  },
  {
    id: 4,
    name: 'Ava',
    age: 25,
    location: 'Austin, TX',
    bio: 'Music producer, foodie, always up for adventures',
    image: 'https://images.unsplash.com/photo-1502685905862-32d5d3a949da?w=500&h=600&fit=crop',
    interests: ['Music', 'Cooking', 'Gaming'],
  },
  {
    id: 5,
    name: 'Isabella',
    age: 28,
    location: 'Seattle, WA',
    bio: 'Tech enthusiast, coffee lover, mountain hiker',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&h=600&fit=crop',
    interests: ['Technology', 'Nature', 'Coffee'],
  },
]

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedProfiles, setLikedProfiles] = useState<number[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 1, scale: 1, rotation: 0, y: 0 })
    }

    // Set up draggable for current card
    if (cardRef.current && !prefersReducedMotion && typeof window !== 'undefined') {
      try {
        const draggable = Draggable.create(cardRef.current, {
          type: 'x,y',
          edgeResistance: 0.65,
          bounds: containerRef.current,
          onDrag() {
            const progress = Math.abs(this.x) / window.innerWidth
            gsap.set(cardRef.current, {
              opacity: 1 - progress * 0.5,
              rotation: progress * 20 * (this.x > 0 ? 1 : -1),
            })
          },
          onDragEnd() {
            const threshold = window.innerWidth * 0.3
            if (Math.abs(this.x) > threshold) {
              const direction = this.x > 0 ? 'right' : 'left'
              swipeCard(direction)
            } else {
              gsap.to(cardRef.current, {
                x: 0,
                y: 0,
                opacity: 1,
                rotation: 0,
                duration: 0.4,
                ease: 'elastic.out(1, 0.5)',
              })
            }
          },
        })[0]
      } catch (e) {
        console.warn('[v0] Draggable setup failed:', e)
      }
    }
  }, [currentIndex])

  const swipeCard = (direction: 'left' | 'right') => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (cardRef.current) {
      const x = direction === 'right' ? 1500 : -1500

      gsap.to(cardRef.current, {
        x,
        y: 200,
        opacity: 0,
        rotation: direction === 'right' ? 30 : -30,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          if (direction === 'right') {
            setLikedProfiles([...likedProfiles, profiles[currentIndex].id])
          }
          nextCard()
        },
      })
    }
  }

  const nextCard = () => {
    if (currentIndex < profiles.length - 1) {
      gsap.set(cardRef.current, {
        opacity: 0,
        scale: 0.8,
        rotation: 0,
        x: 0,
        y: 0,
      })

      setCurrentIndex(currentIndex + 1)

      gsap.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out',
      })
    }
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8">
            <div className="text-6xl mb-4">🎉</div>
            <H3 className="mb-4">You&apos;ve reached the end!</H3>
            <Body className="text-muted-foreground mb-6">
              Check your matches or come back later for more profiles.
            </Body>
            <Link href="/" className="no-underline inline-block w-full">
              <Button fullWidth variant="primary">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const profile = profiles[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-background/90 to-background/50 backdrop-blur-lg border-b border-border/30 sticky top-0 shadow-lg">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              ← Home
            </Button>
          </Link>
          <H3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover
          </H3>
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-6">
        <div className="h-2 bg-border/30 rounded-full overflow-hidden shadow-sm">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300 shadow-lg"
            style={{ width: `${((currentIndex + 1) / profiles.length) * 100}%` }}
          />
        </div>
        <Caption className="mt-3 text-muted-foreground font-medium">
          {currentIndex + 1} of {profiles.length}
        </Caption>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="relative z-10 max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
      >
        {/* Card stack effect */}
        <div className="relative w-full max-w-sm h-96 sm:h-[600px]">
          {/* Back cards (preview) */}
          {[2, 1].map((i) => {
            const nextIndex = currentIndex + i
            if (nextIndex >= profiles.length) return null

            return (
              <div
                key={profiles[nextIndex].id}
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl will-animate"
                style={{
                  transform: `translateY(${i * 12}px) scale(${1 - i * 0.02})`,
                  zIndex: -i,
                  opacity: 0.9 - i * 0.1,
                }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-primary/50 to-accent/50">
                  <img
                    src={profiles[nextIndex].image}
                    alt={profiles[nextIndex].name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            )
          })}

          {/* Current card */}
          <div
            ref={cardRef}
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl will-animate cursor-grab active:cursor-grabbing bg-card"
          >
            <div className="relative w-full h-full">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Card info overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="mb-4">
                  <H3 className="text-white mb-1">
                    {profile.name}, {profile.age}
                  </H3>
                  <Caption className="text-white/80">{profile.location}</Caption>
                </div>

                <Body className="text-white/90 mb-4 line-clamp-2">{profile.bio}</Body>

                {/* Interests tags */}
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-sm text-white/90 border border-white/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 mt-12 justify-center will-animate">
          <button
            onClick={() => swipeCard('left')}
            className="w-16 h-16 rounded-full bg-card border-2 border-border hover:border-destructive hover:bg-destructive/10 flex items-center justify-center text-2xl transition-all duration-200 shadow-lg hover:shadow-destructive/30 hover:scale-110 active:scale-95"
          >
            ✕
          </button>

          <button
            onClick={() => swipeCard('right')}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-primary flex items-center justify-center text-2xl transition-all duration-200 shadow-xl shadow-primary/30 hover:scale-110 active:scale-95"
          >
            ♥
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center will-animate">
          <Caption className="text-muted-foreground">
            Swipe left to pass, right to like
          </Caption>
        </div>
      </div>
    </div>
  )
}
