'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { GradientBG } from '@/components/gradient-bg'
import { Button } from '@/components/button'
import { H1, H2, H3, Body, Caption } from '@/components/typography'
import { animations } from '@/lib/animations'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const subheadingRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const floatingCardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Prevent animations if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const tl = gsap.timeline()

    // Stagger text reveal for main heading
    if (headingRef.current) {
      const text = headingRef.current
      const chars = text.textContent?.split('') || []
      text.textContent = ''

      chars.forEach((char) => {
        const span = document.createElement('span')
        span.textContent = char === ' ' ? '\u00A0' : char
        span.style.display = 'inline-block'
        span.style.opacity = '0'
        text.appendChild(span)
      })

      tl.to(text.querySelectorAll('span'), {
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'back.out',
      })
    }

    // Fade in subheading
    if (subheadingRef.current) {
      gsap.set(subheadingRef.current, { opacity: 0, y: 20 })
      tl.to(
        subheadingRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        0.3
      )
    }

    // CTA buttons entrance
    if (ctaRef.current) {
      const buttons = ctaRef.current.querySelectorAll('button')
      gsap.set(buttons, { opacity: 0, y: 30 })
      tl.to(
        buttons,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'elastic.out(1, 0.7)',
        },
        0.5
      )
    }

    // Floating cards animation
    if (floatingCardsRef.current) {
      const cards = floatingCardsRef.current.querySelectorAll('.floating-card')
      gsap.set(cards, { opacity: 0, scale: 0.8 })
      cards.forEach((card, i) => {
        tl.to(
          card,
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out',
          },
          0.4 + i * 0.2
        )

        // Continuous floating animation
        gsap.to(card, {
          y: -20,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2,
        })
      })
    }
  }, [])

  return (
    <div className="relative w-full">
      <GradientBG variant="primary">
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
        
        <div className="relative z-10 h-screen flex flex-col items-center justify-center px-4" ref={containerRef}>
          {/* Main heading with staggered character animation */}
          <div className="text-center space-y-8 max-w-4xl">
            <div ref={headingRef} className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-xl">
              Find Your Match
            </div>

            {/* Subheading */}
            <div ref={subheadingRef} className="space-y-4">
              <Body className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
                Connect with genuine people. Discover real chemistry. Build meaningful relationships.
              </Body>
              <Caption className="text-lg text-white/80 drop-shadow-lg">
                Matcha makes dating real again
              </Caption>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/onboarding" className="no-underline">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/discover" className="no-underline">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/20">
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating cards showcase */}
          <div
            ref={floatingCardsRef}
            className="absolute bottom-20 left-0 right-0 flex justify-center gap-8 flex-wrap px-4"
          >
            <div className="floating-card bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <p className="font-semibold text-foreground">Smart Matching</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Our algorithm learns your preferences to suggest compatible matches
              </p>
            </div>

            <div className="floating-card bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <p className="font-semibold text-foreground">Verified Profiles</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Every profile is verified for authenticity and safety
              </p>
            </div>

            <div className="floating-card bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <p className="font-semibold text-foreground">Real Connections</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Focus on quality matches over endless swiping
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>

        {/* Component showcase link */}
        <Link href="/components" className="absolute top-6 right-6 z-10 no-underline">
          <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/20">
            View Components
          </Button>
        </Link>
      </GradientBG>

      {/* Features section */}
      <section className="relative bg-gradient-to-b from-background to-card py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <H2 className="mb-4">Why Choose Matcha?</H2>
            <Body className="text-muted-foreground">
              Experience dating the way it should be—intentional, authentic, and focused on connection.
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '💫',
                title: 'Meaningful Connections',
                description: 'Move beyond superficial swipes. Our matching system focuses on compatibility.',
              },
              {
                icon: '🔒',
                title: 'Your Privacy Matters',
                description: 'Control exactly what you share and who sees your profile.',
              },
              {
                icon: '💬',
                title: 'Easy Messaging',
                description: 'Connect instantly with matches and start meaningful conversations.',
              },
              {
                icon: '🎯',
                title: 'Better Matches',
                description: 'Answer thoughtful questions to improve compatibility.',
              },
              {
                icon: '✨',
                title: 'Verified Profiles',
                description: 'Meet real people with verified photos and genuine intentions.',
              },
              {
                icon: '❤️',
                title: 'Built for Relationships',
                description: 'Designed to help you find lasting love, not just a swipe.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <H3 className="text-lg mb-2">{feature.title}</H3>
                <Body className="text-sm text-muted-foreground">{feature.description}</Body>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative bg-gradient-to-r from-primary via-accent to-secondary py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full mix-blend-overlay" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <H2 className="mb-4 text-white">Ready to Find Your Match?</H2>
          <Body className="mb-8 text-white/90 text-lg">
            Join thousands of people looking for genuine connections.
          </Body>
          <Link href="/onboarding" className="no-underline inline-block">
            <Button size="lg" variant="primary" className="bg-white text-primary hover:bg-white/90">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
