# Matcha - Dating App UI Design System

A bold, original dating app interface built with **Next.js 16**, **GSAP 3** for heavy motion design, **Tailwind CSS**, and **Radix UI**. Features expressive typography (Poppins), a cohesive color system with pinkish red and pink accents, and purposeful animations throughout.

## Color Palette

### Light Mode
- **Background**: Pure white (`#FFFFFF`)
- **Foreground**: Pure black (`#000000`)
- **Primary (Pinkish Red)**: `#f43f5e` (rose-600)
- **Accent (Hot Pink)**: `#ec4899` (pink-600)
- **Secondary (Soft Pink)**: `#f9a8d4` (pink-300)
- **Muted**: `#e5e7eb` (gray-200)
- **Muted Foreground**: `#6b7280` (gray-500)

### Dark Mode
- **Background**: Deep black (`#0a0a0f`)
- **Foreground**: Off-white (`#f5f5fa`)
- **Primary (Bright Red)**: `#ff476f`
- **Accent (Hot Pink)**: `#f472b6` (pink-400)
- **Secondary (Bright Pink)**: `#fca5d6` (pink-300)
- **Muted**: `#374555` (slate-700)
- **Muted Foreground**: `#a0a5b4` (slate-400)

### Design Token Variables
All colors are defined as CSS custom properties in `app/globals.css` and support transparency via the `<alpha-value>` pattern. Dark mode is automatically applied via `.dark` class.

## Typography

**Font Family**: Poppins (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800, 900
- Loaded from `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`

### Typography Components
- **H1**: `text-5xl md:text-6xl font-extrabold` - Hero headlines
- **H2**: `text-4xl md:text-5xl font-bold` - Section titles
- **H3**: `text-2xl md:text-3xl font-bold` - Card titles
- **Body**: `text-base md:text-lg leading-relaxed` - Default body text
- **Caption**: `text-sm text-muted-foreground` - Secondary text

## Core Components

### Button
- **Variants**: `primary`, `secondary`, `outline`, `ghost`
- **Sizes**: `sm` (px-4 py-2), `md` (px-6 py-3), `lg` (px-8 py-4)
- **Features**: Smooth transitions, active scale-down, shadow effects, hover color shifts
- **Accessibility**: Full keyboard support, focus states

### Card
- **Background**: Card color with subtle transparency
- **Border**: Thin border with muted opacity
- **Rounded**: 1.5rem radius for modern feel
- **Elevation**: Shadow with primary color tint on hover
- **Variants**: `CardHeader`, `CardContent`, `CardFooter` for structured layouts

### Avatar
- **Sizes**: `sm` (40px), `md` (48px), `lg` (64px), `xl` (96px)
- **Background**: Gradient from primary to accent
- **Border Radius**: Full circle (100%)
- **Shadow**: Subtle depth shadow
- **Images**: CORS-friendly with `crossOrigin="anonymous"`

### GradientBG
- **Canvas-based**: Animated gradient background with subtle blob effects
- **Variants**: `primary` (red→pink), `secondary` (orange→cyan), `dark` (dark tones)
- **Animation**: Continuous floating blob animations
- **Responsive**: Automatically resizes on window resize

## GSAP Animation System

### Core Animation Library (`lib/animations.ts`)

**Staggered Reveals**
```typescript
staggeredTextReveal(element)     // Character-by-character text reveal
staggeredReveal(container, selector) // Item stagger animations
```

**Entrance Animations**
```typescript
fadeInScale(element, delay)      // Fade + scale up
slideIn(element, direction, delay) // Slide from direction
bounceIn(element, delay)         // Elastic bounce entrance
blurIn(element, delay)           // Blur-in effect
```

**Interactive**
```typescript
cardSwipeOut(element, direction) // Card swipe for dating app
pulse(element, scale, duration)  // Pulsing animation loop
float(element, distance)         // Floating effect
shimmer(element)                 // Opacity pulse
```

**Draggable**
```typescript
setupDraggableCard(element, onSwipe) // Swipe detection & animation
```

### GSAP Hooks (`hooks/use-gsap.ts`)

- `useGsapReveal()` - Auto-reveal on mount
- `useGsapStagger(itemSelector)` - Staggered item animations
- `useGsapFloat()` - Continuous floating motion
- `useGsapPulse(scale, duration)` - Pulse animation
- `useGsapOnHover()` - Hover scale effects
- `useGsapTimeline()` - Create complex animation sequences

### Motion Preferences
All animations respect `prefers-reduced-motion: reduce` for accessibility. Animations are automatically disabled for users with motion preferences.

## Pages & Features

### 1. Landing Page (`/`)
- **Hero Section**: Staggered text reveal with character animation
- **Animated CTA Buttons**: Elastic entrance with stagger
- **Floating Cards**: Continuous floating animation with offset timing
- **Features Grid**: Hover effects with scale and shadow transitions
- **Gradient Background**: Animated primary gradient with opacity effects

### 2. Onboarding (`/onboarding`)
- **Multi-step Form**: 6-step flow with slide transitions
- **Progress Bar**: Animated width change on step change
- **Slide Animation**: Fade + slide-x transitions between steps
- **Input Fields**: Styled form controls with focus states
- **Selection Cards**: Interest and preference selection UI

### 3. Discover (`/discover`)
- **Card Swipe Mechanics**: GSAP Draggable with real-time rotation/opacity
- **Threshold Detection**: 30% swipe distance triggers card removal
- **Card Stack Effect**: Back cards visible with scale and offset
- **Dynamic Buttons**: Like/Pass buttons with hover states
- **Profile Data**: User images, bio, interests, location
- **Keyboard Support**: Click buttons or drag to interact

### 4. Profile (`/profile`)
- **Smooth Reveals**: Section stagger animations on load
- **Avatar Entrance**: Scale + opacity on mount
- **Photo Grid**: Hover effects with scale and shadow
- **Interest Tags**: Styled chips with primary color
- **Looking For Section**: Radio-style options with visual feedback

### 5. Matches (`/matches`)
- **Match List**: Staggered item animations
- **Match Score Badge**: Gradient circle with percentage
- **Last Message Preview**: Truncated text with timestamp
- **Hover Interactions**: Border and shadow effects

## Spacing & Layout

### Grid System
- **Tailwind Defaults**: Consistent spacing scale (4px base)
- **Gap Classes**: `gap-4`, `gap-6`, `gap-8` for consistent spacing
- **Responsive**: `md:` and `lg:` prefixes for breakpoints
- **Padding**: `px-4 sm:px-6 lg:px-8` for content sections

### Responsive Breakpoints
- **Mobile First**: Default mobile, then `md:` (768px), `lg:` (1024px)
- **Mobile**: Full-width layouts, single column
- **Tablet**: Optimized 2-column grids
- **Desktop**: Full 3-column layouts with max-width containers

## Border Radius
- **Default (`--radius`)**: `0.75rem` (12px) - Modern, slightly rounded
- **Cards**: `rounded-2xl` (1.5rem) - Prominent, friendly
- **Buttons**: `rounded-lg` (0.5rem) - Subtle, refined
- **Avatars**: `rounded-full` (50%) - Perfect circles

## Shadows & Elevation

### Shadow System
- **Subtle**: `shadow-md` - Small cards, hover states
- **Medium**: `shadow-lg` - Elevated cards, buttons
- **Heavy**: `shadow-2xl` - Modal dialogs, primary elements
- **Color Tints**: Primary-tinted shadows for cohesion (`shadow-primary/30`)

## Accessibility Features

1. **Reduced Motion Support**: All GSAP animations disabled for `prefers-reduced-motion: reduce`
2. **Color Contrast**: All text meets WCAG AA standards (4.5:1 minimum)
3. **Focus States**: Visible focus rings on interactive elements
4. **Semantic HTML**: Proper heading hierarchy, form labels
5. **Alt Text**: All images have descriptive alt text
6. **ARIA**: Proper roles and attributes where needed

## Performance Optimizations

1. **Will-Change**: `.will-animate` class on animated elements
2. **GPU Acceleration**: CSS transforms used for animations
3. **Lazy Loading**: Images loaded with native lazy loading
4. **Code Splitting**: Pages use dynamic imports where beneficial
5. **Turbopack**: Built-in fast compilation with Next.js 16

## Development Setup

### Install Dependencies
```bash
pnpm install
pnpm add gsap
```

### Run Development Server
```bash
pnpm dev
# Open http://localhost:3000
```

### Build for Production
```bash
pnpm build
pnpm start
```

## File Structure
```
/app
  /onboarding
    page.tsx         # Multi-step onboarding flow
  /discover
    page.tsx         # Card swipe interface
  /profile
    page.tsx         # User profile view
  /matches
    page.tsx         # Match list view
  page.tsx           # Landing page
  layout.tsx         # Root layout with metadata
  globals.css        # Design tokens, utilities, imports

/components
  typography.tsx     # H1, H2, H3, Body, Caption, Label
  button.tsx         # Button component with variants
  card.tsx           # Card components with sub-components
  avatar.tsx         # Avatar component
  gradient-bg.tsx    # Canvas-based gradient background

/hooks
  use-gsap.ts        # GSAP animation hooks

/lib
  animations.ts      # GSAP animation utilities
  utils.ts           # cn() function for classNames
```

## Customization Guide

### Change Primary Colors
Edit `app/globals.css`:
```css
:root {
  --primary: 244 63 94;        /* RGB format */
  --accent: 236 72 153;
  --secondary: 249 168 212;
}

.dark {
  --primary: 255 71 105;
  --accent: 244 114 182;
  --secondary: 252 165 214;
}
```

### Adjust Typography Scale
Modify Tailwind config in `tailwind.config.ts`:
```typescript
export const theme = {
  extend: {
    fontSize: {
      xs: ['0.75rem', '1rem'],
      // ... customize as needed
    }
  }
}
```

### Disable Dark Mode
Remove `.dark` handling from `globals.css` and update theme detection in layout.

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari 14+, Chrome Android
- **CSS Support**: Custom properties, grid, flexbox, CSS animations
- **JS Support**: ES2020+, async/await, modern DOM APIs

## License
Open source - Free to use and modify for personal and commercial projects.
