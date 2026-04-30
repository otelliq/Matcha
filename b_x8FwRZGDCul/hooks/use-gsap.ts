'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useGsapReveal() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Set initial state
    gsap.set(ref.current, {
      opacity: 0,
      y: 30,
    })

    // Animate in
    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    })
  }, [])

  return ref
}

export function useGsapStagger(itemSelector: string) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const items = ref.current.querySelectorAll(itemSelector)

    gsap.set(items, {
      opacity: 0,
      y: 30,
    })

    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    })
  }, [itemSelector])

  return ref
}

export function useGsapFloat() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      y: -20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  return ref
}

export function useGsapPulse(scale = 1.05, duration = 0.8) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      scale,
      duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [scale, duration])

  return ref
}

export function useGsapOnHover() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return ref
}

export function useGsapTimeline() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  if (!timelineRef.current) {
    timelineRef.current = gsap.timeline()
  }

  return timelineRef.current
}
