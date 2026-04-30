'use client'

import React, { useEffect, useRef } from 'react'

interface GradientBGProps {
  variant?: 'primary' | 'secondary' | 'dark'
  className?: string
  children?: React.ReactNode
}

export function GradientBG({ variant = 'primary', className = '', children }: GradientBGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()

    const gradients = {
      primary: {
        colors: ['#f43f5e', '#ec4899', '#f97316'],
      },
      secondary: {
        colors: ['#f97316', '#d946ef', '#0891b2'],
      },
      dark: {
        colors: ['#1f2937', '#6b21a8', '#dc2626'],
      },
    }

    const colors = gradients[variant].colors
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add animated blobs with requestAnimationFrame
    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.002

      // Draw animated circles with opacity
      const circles = [
        { x: Math.sin(time) * 100 + canvas.width * 0.3, y: Math.cos(time * 0.7) * 100 + canvas.height * 0.3, r: 200 },
        { x: Math.sin(time * 0.5) * 100 + canvas.width * 0.7, y: Math.cos(time * 0.4) * 100 + canvas.height * 0.7, r: 150 },
      ]

      circles.forEach((circle) => {
        ctx.globalAlpha = 0.1
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [variant])

  return (
    <div className={`relative w-full h-screen overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: 'block' }}
      />
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </div>
  )
}
