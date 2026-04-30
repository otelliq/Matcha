'use client'

import Link from 'next/link'
import { Button } from '@/components/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/card'
import { Avatar } from '@/components/avatar'
import { H1, H2, H3, Body, Caption, Label } from '@/components/typography'

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-bl from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 backdrop-blur-lg border-b border-border/30 py-10 shadow-lg relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-primary hover:bg-primary/10">
              ← Back to Home
            </Button>
          </Link>
          <H1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Matcha Component Library</H1>
          <Body className="text-muted-foreground mt-3 font-medium">
            All reusable components used throughout the dating app
          </Body>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Typography */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Typography</H2>
          <div className="space-y-6">
            <div>
              <Caption className="mb-2">H1 - Hero Headlines</Caption>
              <H1>This is an H1 headline</H1>
            </div>
            <div>
              <Caption className="mb-2">H2 - Section Titles</Caption>
              <H2>This is an H2 headline</H2>
            </div>
            <div>
              <Caption className="mb-2">H3 - Card/Subsection Titles</Caption>
              <H3>This is an H3 headline</H3>
            </div>
            <div>
              <Caption className="mb-2">Body - Default Text</Caption>
              <Body>
                This is body text used for paragraphs and content. The Poppins font provides a playful yet
                professional appearance perfect for a modern dating app.
              </Body>
            </div>
            <div>
              <Caption>Caption - Secondary Text (this is caption text)</Caption>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">Buttons</H2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary */}
            <div>
              <Caption className="mb-4">Primary Variant</Caption>
              <div className="space-y-3">
                <Button variant="primary" size="sm">
                  Small Button
                </Button>
                <Button variant="primary" size="md">
                  Medium Button
                </Button>
                <Button variant="primary" size="lg">
                  Large Button
                </Button>
                <Button variant="primary" size="lg" fullWidth>
                  Full Width Button
                </Button>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <Caption className="mb-4">Secondary Variant</Caption>
              <div className="space-y-3">
                <Button variant="secondary" size="sm">
                  Small Button
                </Button>
                <Button variant="secondary" size="md">
                  Medium Button
                </Button>
                <Button variant="secondary" size="lg">
                  Large Button
                </Button>
              </div>
            </div>

            {/* Outline */}
            <div>
              <Caption className="mb-4">Outline Variant</Caption>
              <div className="space-y-3">
                <Button variant="outline" size="sm">
                  Small Button
                </Button>
                <Button variant="outline" size="md">
                  Medium Button
                </Button>
                <Button variant="outline" size="lg">
                  Large Button
                </Button>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <Caption className="mb-4">Ghost Variant</Caption>
              <div className="space-y-3">
                <Button variant="ghost" size="sm">
                  Small Button
                </Button>
                <Button variant="ghost" size="md">
                  Medium Button
                </Button>
                <Button variant="ghost" size="lg">
                  Large Button
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Cards</H2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <H3>Card Title</H3>
              </CardHeader>
              <CardContent>
                <Body className="text-muted-foreground">
                  This is a card with header, content, and footer sections. Cards are used throughout the app for
                  organizing information.
                </Body>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button variant="primary" size="sm">
                  Confirm
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <H3>Match Card</H3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                      alt="Sample avatar"
                      size="lg"
                    />
                    <div>
                      <H3 className="text-lg">Sarah, 26</H3>
                      <Caption>Los Angeles, CA</Caption>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" fullWidth>
                  Pass
                </Button>
                <Button variant="primary" size="sm" fullWidth>
                  Like
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Avatars */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Avatars</H2>
          <div className="flex items-end gap-8">
            <div>
              <Caption className="mb-3">Small (40px)</Caption>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                alt="Avatar small"
                size="sm"
              />
            </div>
            <div>
              <Caption className="mb-3">Medium (48px)</Caption>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                alt="Avatar medium"
                size="md"
              />
            </div>
            <div>
              <Caption className="mb-3">Large (64px)</Caption>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                alt="Avatar large"
                size="lg"
              />
            </div>
            <div>
              <Caption className="mb-3">Extra Large (96px)</Caption>
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
                alt="Avatar xlarge"
                size="xl"
              />
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Form Elements</H2>
          <Card className="bg-card/40 border-border/50">
            <CardHeader>
              <H3>Form Inputs</H3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Text Input</Label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <Label>Text Area</Label>
                  <textarea
                    placeholder="Write your bio..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <Label>Select Dropdown</Label>
                  <select className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Choose an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>

                <div>
                  <Label>Checkbox</Label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-primary" />
                    <Body>I agree to the terms and conditions</Body>
                  </label>
                </div>

                <div>
                  <Label>Radio Button</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="demo" className="w-5 h-5 accent-primary" />
                      <Body>Option 1</Body>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="demo" className="w-5 h-5 accent-primary" />
                      <Body>Option 2</Body>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="mb-16 p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg">
          <H2 className="mb-8 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">Color Palette</H2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: 'Primary', hex: '#f43f5e', css: 'bg-primary' },
              { name: 'Accent', hex: '#ec4899', css: 'bg-accent' },
              { name: 'Secondary', hex: '#f9a8d4', css: 'bg-secondary' },
              { name: 'Muted', hex: '#e5e7eb', css: 'bg-muted' },
              { name: 'Background', hex: '#FFFFFF', css: 'bg-background' },
              { name: 'Foreground', hex: '#000000', css: 'bg-foreground' },
            ].map((color) => (
              <div key={color.name}>
                <div className={`w-full h-24 rounded-lg ${color.css} border border-border mb-3`} />
                <H3 className="text-base">{color.name}</H3>
                <Caption>{color.hex}</Caption>
              </div>
            ))}
          </div>
        </section>

        {/* Links */}
        <section className="mb-16 p-8 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border border-primary/30 shadow-lg">
          <H2 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Quick Links</H2>
          <div className="flex flex-wrap gap-4">
            <Link href="/">
              <Button variant="primary">Home (Landing)</Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="primary">Onboarding</Button>
            </Link>
            <Link href="/discover">
              <Button variant="primary">Discover</Button>
            </Link>
            <Link href="/profile">
              <Button variant="primary">Profile</Button>
            </Link>
            <Link href="/matches">
              <Button variant="primary">Matches</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
