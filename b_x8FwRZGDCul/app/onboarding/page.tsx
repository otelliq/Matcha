'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { Button } from '@/components/button'
import { H2, H3, Body, Label } from '@/components/typography'
import { Card, CardContent, CardHeader } from '@/components/card'

const steps = [
  {
    title: 'Welcome to Matcha',
    subtitle: 'Let&apos;s start your journey',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">👋</div>
          <Body className="text-lg text-muted-foreground">
            We&apos;re excited to help you find meaningful connections. Let&apos;s get started!
          </Body>
        </div>
      </div>
    ),
  },
  {
    title: 'About You',
    subtitle: 'Tell us your basics',
    content: (
      <div className="space-y-4">
        <div>
          <Label>First Name</Label>
          <input
            type="text"
            placeholder="John"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <Label>Age</Label>
          <input
            type="number"
            placeholder="25"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <Label>Location</Label>
          <input
            type="text"
            placeholder="New York, NY"
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    ),
  },
  {
    title: 'Interests',
    subtitle: 'What are you passionate about?',
    content: (
      <div className="grid grid-cols-2 gap-3">
        {[
          'Travel',
          'Sports',
          'Music',
          'Art',
          'Cooking',
          'Reading',
          'Gaming',
          'Fitness',
          'Movies',
          'Photography',
          'Yoga',
          'Nature',
        ].map((interest) => (
          <button
            key={interest}
            className="px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 transition-all duration-200 font-medium"
          >
            {interest}
          </button>
        ))}
      </div>
    ),
  },
  {
    title: 'Looking For',
    subtitle: 'What matters most to you?',
    content: (
      <div className="space-y-4">
        {[
          { title: 'Long-term relationship', desc: 'Looking for something serious' },
          { title: 'Dating', desc: 'Open to seeing where it goes' },
          { title: 'New friends', desc: 'Connection without pressure' },
        ].map((option) => (
          <label key={option.title} className="flex items-center gap-4 p-4 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
            <input type="radio" name="looking" className="w-5 h-5 accent-primary" />
            <div>
              <Body className="font-semibold">{option.title}</Body>
              <Body className="text-sm text-muted-foreground">{option.desc}</Body>
            </div>
          </label>
        ))}
      </div>
    ),
  },
  {
    title: 'Photo',
    subtitle: 'Add a profile picture',
    content: (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/10 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <Body className="text-sm text-muted-foreground">Click to upload photo</Body>
            </div>
          </div>
        </div>
        <Body className="text-center text-sm text-muted-foreground">
          Use a clear, recent photo where your face is visible
        </Body>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    subtitle: 'Start discovering matches',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <Body className="text-lg text-muted-foreground">
            Your profile is complete. Time to find your perfect match!
          </Body>
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          x: 50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      )
    }

    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${((step + 1) / steps.length) * 100}%`,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }, [step])

  const handleNext = () => {
    if (step < steps.length - 1) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setStep(step + 1),
      })
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setStep(step - 1),
      })
    }
  }

  const isLastStep = step === steps.length - 1

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background opacity-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/5 to-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="bg-muted rounded-full h-2 overflow-hidden shadow-sm">
            <div
              className="bg-gradient-to-r from-primary via-accent to-secondary h-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <Body className="text-sm text-muted-foreground mt-3 font-medium">
            Step {step + 1} of {steps.length}
          </Body>
        </div>

        {/* Header */}
        <div className="px-6 py-8 border-b border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="max-w-2xl mx-auto relative z-10">
            <H2 className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{steps[step].title}</H2>
            <Body className="text-muted-foreground font-medium">{steps[step].subtitle}</Body>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div ref={contentRef} className="will-animate">
              {steps[step].content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-8 border-t border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-2xl mx-auto flex justify-between gap-4 relative z-10">
            <Button
              onClick={handlePrev}
              disabled={step === 0}
              variant="outline"
              size="lg"
              className="disabled:opacity-50 disabled:cursor-not-allowed border-primary/30 hover:bg-primary/10 text-primary"
            >
              Back
            </Button>

            {isLastStep ? (
              <Link href="/discover" className="flex-1 no-underline">
                <Button size="lg" variant="primary" fullWidth>
                  Start Discovering
                </Button>
              </Link>
            ) : (
              <Button onClick={handleNext} variant="primary" size="lg" className="flex-1">
                Next
              </Button>
            )}
          </div>

          {/* Step counter */}
          <div className="text-center mt-4">
            <Body className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </Body>
          </div>
        </div>
      </div>
    </main>
  )
}
