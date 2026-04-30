'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Button } from '@/components/button'
import { Avatar } from '@/components/avatar'
import { Card, CardContent } from '@/components/card'
import { H2, H3, Body, Caption } from '@/components/typography'

const matches = [
  {
    id: 1,
    name: 'Sophie',
    age: 26,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    matchScore: 92,
    lastMessage: 'That sounds amazing! When are you free?',
    time: '2 hours ago',
  },
  {
    id: 2,
    name: 'Emma',
    age: 24,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    matchScore: 87,
    lastMessage: 'I love that place too!',
    time: '5 hours ago',
  },
  {
    id: 3,
    name: 'Olivia',
    age: 27,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    matchScore: 85,
    lastMessage: 'Your profile looks interesting',
    time: '1 day ago',
  },
]

export default function MatchesPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    if (containerRef.current) {
      gsap.set(containerRef.current, { opacity: 0, y: 30 })
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
    }

    if (itemsRef.current) {
      const items = itemsRef.current.querySelectorAll('[data-match]')
      gsap.set(items, { opacity: 0, x: -30 })
      gsap.to(items, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3,
      })
    }
  }, [])

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-primary/10 to-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
        </div>
        <Card className="max-w-md text-center bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <div className="text-6xl mb-4">💭</div>
            <H3 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">No Matches Yet</H3>
            <Body className="text-muted-foreground mb-8 leading-relaxed">
              Start swiping to find your matches!
            </Body>
            <Link href="/discover" className="no-underline inline-block w-full">
              <Button fullWidth className="bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg">
                Start Discovering
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-background/90 to-background/50 backdrop-blur-lg border-b border-border/30 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              ← Back
            </Button>
          </Link>
          <H2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Matches</H2>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10" ref={containerRef}>
        <div className="space-y-4" ref={itemsRef}>
          {matches.map((match) => (
            <Card
              key={match.id}
              data-match
              className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer group"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-5">
                  {/* Avatar with match score */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={match.image}
                      alt={match.name}
                      size="lg"
                    />
                    <div className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                      {match.matchScore}%
                    </div>
                  </div>

                  {/* Match info */}
                  <div className="flex-1 min-w-0">
                    <H3 className="mb-1 text-primary group-hover:text-accent transition-colors">
                      {match.name}, {match.age}
                    </H3>
                    <Body className="text-sm text-muted-foreground truncate mb-2 group-hover:text-foreground/80 transition-colors">
                      {match.lastMessage}
                    </Body>
                    <Caption className="text-xs text-muted-foreground/70">
                      {match.time}
                    </Caption>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    <Button variant="primary" size="sm">
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
