# Matcha API Contracts

All endpoints live under `/api/v1/`.

## Global Conventions

- Pagination uses `limit` + `offset` everywhere a list is returned.
- Default `limit` is `20`; maximum `limit` is `100`.
- List endpoints that need ranking/filtering accept `?sort=` and `?filter[...]` query params.
- Standard error shape for every API 4xx/5xx response:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "human readable",
    "fields": {
      "field_name": ["error"]
    }
  }
}
```

- `fields` is only present for validation errors.
- JWT auth uses SimpleJWT access + refresh tokens.
- Refresh rotation is enabled and refresh tokens are blacklisted on logout.
- Any profile response shown to another user excludes email and password.
- Blocked users cannot query each other’s public profile or interaction endpoints.
- Auth endpoints are rate-limited to reduce brute-force attempts.
- Server-side profile completion rejects `date_of_birth` values that make the user younger than 18.
- Changing email via `PATCH /profiles/me/` clears `email_verified_at` and sends a new verification email.
- Photo uploads are validated by actual image content, not just extension or reported MIME type.

## WebSockets

### Authentication handshake

WebSocket clients authenticate with the same JWT access token used for REST.
Accepted forms:

- `Authorization: Bearer <access_token>` header when the client can set headers.
- `?access_token=<access_token>` query parameter for browser clients.

If authentication fails, the socket is closed with code `4401`.

### Close codes

- `4401`: unauthenticated or invalid token
- `4403`: forbidden, disconnected, blocked, or inactive connection

### `WS /ws/chat/<connection_id>/`
Real-time messaging for a single active mutual connection.

Server accepts only if the connection is active and the two users are not blocking each other.
The server force-closes an open socket with `4403` if the connection becomes inactive because of unlike or block.

Client send payload:
```json
{
  "body": "Hi there"
}
```

Server receive payload:
```json
{
  "id": 1,
  "connection": 10,
  "sender": 2,
  "sender_username": "mario",
  "body": "Hi there",
  "read_at": null,
  "delivered_at": "2026-07-09T10:00:00Z",
  "created_at": "2026-07-09T10:00:00Z",
  "updated_at": "2026-07-09T10:00:00Z"
}
```

Message persistence is written to PostgreSQL immediately; Channels is used only for delivery fan-out, so no batching or polling is introduced.

### `WS /ws/notifications/`
One authenticated notification stream per user identity. Multiple browser tabs may subscribe to the same user group.

Server payload shape:
```json
{
  "id": 1,
  "recipient": 2,
  "actor": 3,
  "actor_username": "alex",
  "kind": "profile_viewed",
  "data": { "profile_id": 10 },
  "read_at": null,
  "delivered_at": "2026-07-09T10:00:00Z",
  "created_at": "2026-07-09T10:00:00Z"
}
```

Supported `kind` values:
- `profile_liked`
- `profile_viewed`
- `message_received`
- `mutual_like`
- `unliked`

Delivery is immediate through Channels group fan-out, with no polling or batching.

## Accounts

### `POST /auth/register/`
Creates a new user and queues an email verification task.

Request:
```json
{
  "email": "user@example.com",
  "username": "mario",
  "first_name": "Mario",
  "last_name": "Rossi",
  "password": "StrongPassphrase123!"
}
```

Response `201`:
```json
{
  "user": {
    "id": 1,
    "username": "mario",
    "first_name": "Mario",
    "last_name": "Rossi",
    "date_joined": "2026-07-09T10:00:00Z"
  },
  "verification_sent": true
}
```

Errors: `400`, `429`.

### `GET /auth/verify-email/<token>/`
Marks the email as verified.

Response `204` on success.

Errors: `404` if token is missing/consumed, `429`.

### `POST /auth/login/`
Returns a JWT pair.

Request:
```json
{
  "email": "user@example.com",
  "password": "StrongPassphrase123!"
}
```

Response `200`:
```json
{
  "access": "...",
  "refresh": "..."
}
```

Errors: `400`, `401`, `429`.

### `POST /auth/logout/`
Blacklists the refresh token.

Request:
```json
{
  "refresh": "..."
}
```

Response `204`.

Errors: `400`, `401`.

### `POST /auth/password-reset/request/`
Queues a password reset email if the account exists.

Request:
```json
{
  "email": "user@example.com"
}
```

Response `204`.

Errors: `400`, `429`.

### `POST /auth/password-reset/confirm/`
Sets a new password using a reset token.

Request:
```json
{
  "token": "reset-token",
  "password": "StrongPassphrase123!"
}
```

Response `204`.

Errors: `400`, `404`, `429`.

### `POST /auth/token/refresh/`
Returns a new access token using a refresh token.

Request:
```json
{
  "refresh": "..."
}
```

Response `200`:
```json
{
  "access": "...",
  "refresh": "..."
}
```

Errors: `400`, `401`.

## Profiles

### `GET /profiles/me/`
Returns the authenticated user’s full profile, including email.

Response `200` shape mirrors `ProfileMeSerializer`:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "mario",
  "first_name": "Mario",
  "last_name": "Rossi",
  "gender": "unset",
  "sexual_preference": "bisexual",
  "biography": "...",
  "date_of_birth": "1999-01-01",
  "latitude": null,
  "longitude": null,
  "city": "Paris",
  "neighborhood": "Le Marais",
  "location_source": "manual",
  "fame_rating": "42.00",
  "fame_rating_components": {},
  "fame_rating_recalculated_at": null,
  "last_seen_at": null,
  "tags": [],
  "pictures": [],
  "email_verified_at": null
}
```

### `PATCH /profiles/me/`
Updates the authenticated user’s account and profile fields.

Request supports the same fields as `GET /profiles/me/` plus partial updates.

Response `200` returns the updated profile.

Errors: `400`, `401`.

Email changes reset `email_verified_at` to `null` and trigger a new verification email.

### `GET /profiles/<id>/`
Returns another user’s public profile.

Response `200` shape mirrors `ProfilePublicSerializer` and excludes email/password.
This records a `ProfileView` entry and emits a `profile_viewed` notification to the viewed user.

Errors: `403` if blocked, `404` if missing.

### `POST /profiles/me/photos/`
Uploads a profile picture.

Request: `multipart/form-data`

Fields:
- `image` required image file
- `is_primary` optional boolean
- `position` optional integer
- `alt_text` optional string

Constraints:
- max 5 photos per profile
- image uploads only
- max file size 5 MB
- the file must be a valid raster image; SVG and executable/archive payloads are rejected

Response `201` returns the created picture.

### `DELETE /profiles/me/photos/<id>/`
Deletes one of the authenticated user’s pictures.

Response `204`.
If the deleted photo was primary, another remaining photo becomes primary.

### `PATCH /profiles/me/location/`
Updates location using GPS or manual fallback.

Request:
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "city": "Paris",
  "neighborhood": "Le Marais"
}
```

Response `200` returns the updated profile.

### `GET /profiles/me/viewers/`
Returns who viewed the authenticated user’s profile.

Response `200` paginated list:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "profile": { "...": "public profile shape" },
      "timestamp": "2026-07-09T10:00:00Z"
    }
  ]
}
```

### `GET /profiles/me/likers/`
Returns who liked the authenticated user’s profile.

Response shape matches `/profiles/me/viewers/`.

## Chat

### `GET /chat/conversations/`
Returns active conversations for the authenticated user.

Response `200` paginated list:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "connection_id": 1,
      "profile": { "...": "public profile shape" },
      "last_message": { "...": "MessageSerializer shape" },
      "unread_count": 2,
      "created_at": "2026-07-09T10:00:00Z",
      "updated_at": "2026-07-09T10:00:00Z"
    }
  ]
}
```

### `GET /chat/<connection_id>/messages/`
Returns the message history for one active connection.

Response `200` paginated list of messages.

### `POST /chat/<connection_id>/messages/mark-read/`
Marks unread messages from the other participant as read so `unread_count` can drop to zero.

Response `200`:
```json
{
  "marked_read": 4
}
```

### `POST /chat/<connection_id>/messages/`
Sends a new message to a connected user.

Request:
```json
{
  "body": "Hi there"
}
```

Response `201` returns the created message.

Realtime delivery happens over the websocket channel for the same connection.

## Notifications

### `GET /notifications/`
Returns notifications for the authenticated user.

Response `200` paginated list of notifications.

### `GET /notifications/unread-count/`
Returns the unread notification count.

Response `200`:
```json
{
  "unread_count": 3
}
```

### `POST /notifications/<id>/mark-read/`
Marks one notification as read.

Response `200` returns the updated notification.

### `POST /notifications/mark-all-read/`
Marks all notifications as read.

Response `200`:
```json
{
  "marked_read": 3
}
```

Realtime delivery happens over the websocket notifications channel.

### `GET /tags/`
Autocomplete-friendly tag listing.

Query params:
- `q` optional search string
- `limit`, `offset`

Response `200` paginated list of tags.

### `POST /tags/`
Creates a reusable tag.

Request:
```json
{
  "name": "Climbing",
  "slug": "climbing"
}
```

Response `201` returns the tag.

## Matching

### `GET /matching/suggestions/`
Personalized suggestions based on proximity, shared tags, fame, and same-area priority.

Query params:
- `sort=same_area|distance|fame|recent|shared_tags`
- `filter[age_min]`
- `filter[age_max]`
- `filter[fame_min]`
- `filter[fame_max]`
- `filter[city]`
- `filter[neighborhood]`
- `filter[latitude]`
- `filter[longitude]`
- `filter[radius_km]`
- `filter[tags]` repeated or comma-separated

Response `200` paginated list of public profiles plus:
- `shared_tags_count`
- `distance_km`
- `same_area`
- `match_score`

### `GET /matching/search/`
Advanced search with the same filters as suggestions.

Default sort is `distance`.

Response shape matches `/matching/suggestions/`.

## Interactions

### `POST /interactions/likes/<user_id>/`
Creates or reactivates a like.
A mutual like auto-creates or reactivates a connection.
The requester must have at least one profile picture.
Side effects:
- emits `profile_liked` to the target user
- emits `mutual_like` to both users when a connection is formed

Response `200` or `201`:
```json
{
  "like": { "...": "LikeSerializer shape" },
  "connection_created": true,
  "connection": {
    "id": 1,
    "profile": { "...": "public profile shape" },
    "created_at": "2026-07-09T10:00:00Z",
    "closed_at": null
  }
}
```

### `DELETE /interactions/likes/<user_id>/`
Marks the like inactive and disconnects the pair.

Response shape matches the `POST` response with `connection_created: false` and `connection: null`.
Side effects:
- emits `unliked` to the target user
- force-closes any open chat websocket for the pair

### `POST /interactions/blocks/<user_id>/`
Creates or reactivates a block and disconnects any existing connection.
This reuses the shared disconnect path, so any open chat websocket for the pair is force-closed with `4403`.

Response `201`:
```json
{
  "block": { "...": "BlockSerializer shape" },
  "disconnected": true
}
```

### `DELETE /interactions/blocks/<user_id>/`
Disables the block.

Response shape matches `POST` with `disconnected: false`.

### `POST /interactions/reports/<user_id>/`
Creates a fake-account or abuse report.
Reports are unvalidated by default; moderator review later marks them validated.

Request:
```json
{
  "reason": "fake_profile",
  "details": "Looks automated"
}
```

Response `201`:
```json
{
  "report": { "...": "ReportSerializer shape" }
}
```

### `GET /interactions/connections/`
Returns active mutual connections owned by the authenticated user.

Response `200` paginated list:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "profile": { "...": "public profile shape" },
      "created_at": "2026-07-09T10:00:00Z",
      "closed_at": null
    }
  ]
}
```

## Notes

- Chat and notifications now use Channels + Redis for immediate fan-out.
- The moderation definition of `validated` is human review, not an automatic threshold.
- Fame ratings are recalculated asynchronously by Celery and stored on `Profile`.
