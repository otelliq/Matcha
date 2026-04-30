'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Button } from '@/components/button'
import { Avatar } from '@/components/avatar'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/card'
import { H2, H3, Body, Caption, Label } from '@/components/typography'

export default function ProfilePage() {
  const headerRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline()

    // Profile avatar entrance
    if (profileRef.current) {
      const avatar = profileRef.current.querySelector('[role="img"]')
      if (avatar) {
        gsap.set(avatar, { scale: 0, opacity: 0 })
        tl.to(avatar, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out',
        })
      }
    }

    // Header animations
    if (headerRef.current) {
      const items = headerRef.current.querySelectorAll('h1, p')
      gsap.set(items, { opacity: 0, y: 20 })
      tl.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.2)
    }

    // Sections stagger
    if (sectionsRef.current) {
      const sections = sectionsRef.current.querySelectorAll('[data-section]')
      gsap.set(sections, { opacity: 0, x: 30 })
      tl.to(sections, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.5)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 backdrop-blur-lg border-b border-border/30 py-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6 text-primary hover:bg-primary/10">
              ← Back
            </Button>
          </Link>
          <div ref={headerRef} className="flex items-end gap-6">
            <div ref={profileRef}>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                alt="Your profile"
                size="xl"
                role="img"
              />
            </div>
            <div>
              <H2 className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sarah, 26
              </H2>
              <Caption className="text-muted-foreground font-medium">Los Angeles, CA</Caption>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div ref={sectionsRef} className="space-y-8">
          {/* About section */}
          <Card data-section className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
              <H3 className="text-primary">About Me</H3>
            </CardHeader>
            <CardContent className="pt-6">
              <Body className="text-muted-foreground leading-relaxed">
                Adventurous traveler and coffee enthusiast. I love exploring new places, hiking on weekends, and having deep conversations over a good cup of coffee. Looking for someone who shares a passion for life and is ready for genuine connection.
              </Body>
            </CardContent>
          </Card>

          {/* Interests section */}
          <Card data-section className="bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-border/30 bg-gradient-to-r from-accent/10 to-secondary/10">
              <H3 className="text-accent">Interests</H3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Travel', 'Photography', 'Yoga', 'Hiking', 'Coffee', 'Cooking', 'Art', 'Music', 'Reading'].map(
                  (interest) => (
                    <div
                      key={interest}
                      className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-center font-medium text-primary"
                    >
                      {interest}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photos section */}
          <Card data-section>
            <CardHeader>
              <H3>Photos</H3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1502685905862-32d5d3a949da?w=400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=400&fit=crop',
                ].map((image, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                  >
                    <img
                      src={image}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Looking for section */}
          <Card data-section>
            <CardHeader>
              <H3>Looking For</H3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <Body className="font-semibold">Relationship Type</Body>
                  <Caption>Long-term relationship</Caption>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <Body className="font-semibold">Age Preference</Body>
                  <Caption>24 - 32 years</Caption>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <Body className="font-semibold">Distance</Body>
                  <Caption>Within 15 miles</Caption>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Edit & Settings */}
          <Card data-section>
            <CardFooter className="flex gap-3 pt-6">
              <Button variant="outline" fullWidth>
                Edit Profile
              </Button>
              <Button variant="primary" fullWidth>
                Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
