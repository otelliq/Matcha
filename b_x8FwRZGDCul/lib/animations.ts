import gsap from 'gsap'

export const animations = {
  // Staggered text reveal with characters
  staggeredTextReveal: (element: HTMLElement | string) => {
    const text = typeof element === 'string' ? document.querySelector(element) : element
    if (!text) return

    const chars = text.textContent?.split('') || []
    text.textContent = ''

    chars.forEach((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.opacity = '0'
      text.appendChild(span)
    })

    gsap.to(text.querySelectorAll('span'), {
      opacity: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.out',
    })
  },

  // Fade in with scale
  fadeInScale: (element: HTMLElement | string, delay = 0) => {
    return gsap.to(element, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      delay,
      ease: 'back.out',
    })
  },

  // Slide in from direction
  slideIn: (element: HTMLElement | string, direction: 'left' | 'right' | 'top' | 'bottom' = 'left', delay = 0) => {
    const from = {
      left: { x: -100, opacity: 0 },
      right: { x: 100, opacity: 0 },
      top: { y: -100, opacity: 0 },
      bottom: { y: 100, opacity: 0 },
    }

    return gsap.to(element, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      ...from[direction],
    })
  },

  // Page transition - fade out current, fade in next
  pageTransition: (outElement: HTMLElement | string, inElement: HTMLElement | string) => {
    const tl = gsap.timeline()
    tl.to(outElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
    })
    tl.to(inElement, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut',
    }, 0.2)
    return tl
  },

  // Staggered container reveal
  staggeredReveal: (container: HTMLElement | string, itemSelector: string) => {
    return gsap.to(container, {
      opacity: 1,
    }).to(
      `${typeof container === 'string' ? container + ' ' : ''}${itemSelector}`,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      },
      0
    )
  },

  // Pulse animation
  pulse: (element: HTMLElement | string, scale = 1.1, duration = 0.5) => {
    return gsap.to(element, {
      scale,
      duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  },

  // Bounce entrance
  bounceIn: (element: HTMLElement | string, delay = 0) => {
    return gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'elastic.out(1.2, 0.75)',
    })
  },

  // Rotate entrance
  rotateIn: (element: HTMLElement | string, delay = 0) => {
    return gsap.to(element, {
      opacity: 1,
      rotation: 0,
      duration: 0.8,
      delay,
      ease: 'back.out',
    })
  },

  // Blur in
  blurIn: (element: HTMLElement | string, delay = 0) => {
    gsap.set(element, { filter: 'blur(10px)', opacity: 0 })
    return gsap.to(element, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      delay,
      ease: 'power2.out',
    })
  },

  // Card swipe out
  cardSwipeOut: (element: HTMLElement | string, direction: 'left' | 'right' = 'right') => {
    const x = direction === 'right' ? 500 : -500
    return gsap.to(element, {
      x,
      opacity: 0,
      rotation: direction === 'right' ? 20 : -20,
      duration: 0.5,
      ease: 'power2.in',
    })
  },

  // Gradient animation
  animateGradient: (element: HTMLElement | string) => {
    return gsap.to(element, {
      backgroundPosition: '200% center',
      duration: 4,
      repeat: -1,
      ease: 'none',
    })
  },

  // Floating animation
  float: (element: HTMLElement | string, distance = 20) => {
    return gsap.to(element, {
      y: -distance,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  },

  // Shimmer effect (opacity pulsing)
  shimmer: (element: HTMLElement | string) => {
    return gsap.to(element, {
      opacity: 0.5,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  },

  // Create timeline with multiple animations
  timeline: () => {
    return gsap.timeline()
  },
}

// Draggable card utility for swipe interactions
export function setupDraggableCard(element: HTMLElement, onSwipe: (direction: 'left' | 'right') => void) {
  let isAnimating = false

  const handleMouseDown = (e: MouseEvent) => {
    if (isAnimating) return

    const startX = e.clientX
    const startY = e.clientY
    let moved = false

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      if (Math.abs(diff) > 10) moved = true

      gsap.to(element, {
        x: diff,
        rotation: diff * 0.1,
        opacity: Math.max(0.5, 1 - Math.abs(diff) / 300),
        duration: 0,
      })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      const diff = (e as any).clientX - startX
      if (moved && Math.abs(diff) > 100) {
        isAnimating = true
        const direction = diff > 0 ? 'right' : 'left'
        gsap.to(element, {
          x: diff > 0 ? 500 : -500,
          opacity: 0,
          rotation: diff > 0 ? 30 : -30,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            isAnimating = false
            onSwipe(direction)
          },
        })
      } else {
        gsap.to(element, {
          x: 0,
          rotation: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  element.addEventListener('mousedown', handleMouseDown)

  return () => {
    element.removeEventListener('mousedown', handleMouseDown)
  }
}
