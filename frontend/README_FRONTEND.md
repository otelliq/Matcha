# Matcha Frontend

A modern Next.js dating application built with TypeScript, Tailwind CSS, and real-time WebSocket support.

## Architecture

### Core Infrastructure

- **Authentication Context** (`lib/auth-context.tsx`): Manages user session, login/logout, and token refresh
- **API Client** (`lib/api-client.ts`): Typed fetch wrapper with automatic JWT refresh on 401
- **WebSocket Hooks** (`lib/websocket.ts`): Real-time chat and notification subscriptions with exponential backoff reconnection
- **Toast System** (`lib/toast-context.tsx`): Global error/success notifications
- **Type Definitions** (`lib/types.ts`): Full TypeScript interfaces matching the backend API contract

### Storage Strategy

- **Access Token**: Stored in memory (React context) only
- **Refresh Token**: Set in httpOnly cookie by backend (secure, not accessible to JavaScript)
- **Auto-refresh**: On 401 response, automatically calls `/auth/token/refresh/` and retries

### Components

- **Button**: Primary, secondary, danger variants with loading state
- **Input**: Text input with validation error display and helper text
- **Header**: Navigation bar with notification bell and logout button
- **Footer**: Basic footer with links
- **ProfileCard**: Reusable card for displaying profiles in browse/search/viewers/likers
- **NotificationBell**: Real-time notification dropdown with unread badge
- **ProtectedRoute**: Wrapper that redirects unauthenticated users to /login

## Pages

### Authentication

- **`/login`** - Email/password login form
- **`/register`** - Registration with email verification
- **`/verify-email/[token]`** - Email verification link confirmation
- **`/password-reset/request`** - Request password reset
- **`/password-reset/confirm/[token]`** - Set new password with token

### Profile

- **`/profile/me`** - Edit own profile (all fields, photo manager, tags)
- **`/profile/[id]`** - View public profile with like/block/report actions
- **`/profile/me/viewers`** - List of profile viewers
- **`/profile/me/likers`** - List of people who liked the current user

### Matching & Browse

- **`/browse`** - Personalized suggestions with sorting (same_area, distance, fame, recent, shared_tags) and filtering (age, fame, location)
- **`/search`** - Advanced search with same filters as browse, default sort by distance

### Chat

- **`/chat`** - List of active conversations sorted by last message
- **`/chat/[connectionId]`** - Real-time messaging with WebSocket, message history, mark-read functionality

### Home

- **`/`** - Landing page with login/register options for guests or quick links for authenticated users

## Key Features

### JWT Auth Flow

1. User logs in with email/password
2. Backend returns `{access, refresh}` tokens
3. Access token stored in memory via React context
4. Refresh token set in httpOnly cookie by API proxy
5. API client sets `Authorization: Bearer <token>` header
6. On 401: automatically refreshes token and retries request
7. Logout blacklists refresh token and clears session

### Real-time Messaging

- WebSocket connection to `/ws/chat/<connection_id>/`
- Supports 50 message history per load
- Mark messages as read on open
- Handles connection close codes:
  - `4401`: Authentication failed, redirect to login
  - `4403`: Connection ended (unlike/block), show message and redirect to chat list

### Real-time Notifications

- Single persistent WebSocket connection to `/ws/notifications/`
- Subscribes to user notification group via Channels
- Receives events: `profile_liked`, `profile_viewed`, `message_received`, `mutual_like`, `unliked`
- Toast notifications for engagement events while user is elsewhere in app
- Unread count badge in header
- Dropdown panel with recent notifications

### Profile Management

- Upload up to 5 profile photos with drag-and-drop (file input supported)
- Mark/unmark photos as primary
- Delete photos
- Gender and sexual preference selection
- Age validation (18+)
- Location via GPS or manual fallback (city/neighborhood)
- Multi-select interest tags
- Full biography field

### Matching Algorithm

- Filter by age range, fame rating, location, shared tags
- Sort by: same_area, distance, fame, recent activity, shared tags count
- Distance calculation from profile's coordinates
- Shared tags count visibility

## Setup & Running

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_INTERNAL_URL=http://localhost:8000
```

- `NEXT_PUBLIC_API_URL` defaults to `/api/v1` and should stay same-origin in most setups.
- `BACKEND_INTERNAL_URL` is used by Next.js rewrites to proxy `/api/v1/*` to Django.

### Development

```bash
npm run dev
```

Runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

### Type Checking

```bash
npm run typecheck
```

## API Integration

All API endpoints from the backend API contract are implemented:

- **Auth**: `/auth/register/`, `/auth/login/`, `/auth/logout/`, `/auth/token/refresh/`, etc.
- **Profiles**: `/profiles/me/`, `/profiles/<id>/`, `/profiles/me/photos/`, `/profiles/me/viewers/`, `/profiles/me/likers/`
- **Matching**: `/matching/suggestions/`, `/matching/search/`
- **Chat**: `/chat/conversations/`, `/chat/<connection_id>/messages/`, `/chat/<connection_id>/messages/mark-read/`
- **Interactions**: `/interactions/likes/<user_id>/`, `/interactions/blocks/<user_id>/`, `/interactions/reports/<user_id>/`
- **Notifications**: `/notifications/`, `/notifications/unread-count/`, `/notifications/<id>/mark-read/`, `/notifications/mark-all-read/`
- **Tags**: `/tags/`

## WebSocket Support

### Chat Socket

```javascript
const { messages, send, isConnected, error } = useChatSocket(connectionId);

// Send message
send({ body: "Hello!" });

// Subscribe to messages
useEffect(() => {
  if (messages.length > 0) {
    console.log("New message:", messages[messages.length - 1]);
  }
}, [messages]);
```

### Notification Socket

```javascript
const { notifications, isConnected } = useNotificationSocket();

// Auto-subscribes on app load
// Toast notifications shown for profile_liked, mutual_like, message_received
```

## Responsive Design

- Mobile-first responsive layout
- Tested at 375px width minimum (mobile)
- Tailwind CSS for styling
- Flexbox and grid layouts

## Error Handling

- Standard error shape: `{error: {code, message, fields}}`
- API errors displayed via toast notifications
- Field-level validation errors shown in forms
- Connection errors with exponential backoff retry logic

## Future Enhancements

- Photo drag-and-drop reordering
- Location GPS permission request with manual fallback button
- Real-time online status indicators
- Typing indicators in chat
- Message search and filtering
- Block list management view
- User settings page (email change, password change)
- Dark mode support
- Accessibility improvements (ARIA labels, keyboard navigation)
