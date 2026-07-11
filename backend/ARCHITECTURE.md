# Matcha Backend Architecture

## App responsibilities

- `accounts`: custom user model, registration, email verification, login/logout, and password reset token flow.
- `profiles`: public profile data, tags, photos, location data, and fame rating persistence.
- `matching`: suggestions, search filters, and ranking logic for browse results.
- `interactions`: likes, connections, blocks, reports, profile views, and disconnect rules.
- `chat`: real-time messaging for connected users only.
- `notifications`: real-time notification events plus unread-badge persistence.

## Key design decisions

- The project uses a custom `User` model that extends `AbstractBaseUser` and `PermissionsMixin`.
- Email is the login identifier; `username` stays unique for display and profile URLs.
- Online presence is ephemeral in Redis with a heartbeat; `last_seen_at` is persisted for durable UI fallback.
- Serializer validation is the default input gate; model-level `clean()` rules are the backstop.
- Blocked users are filtered out at query time and also rejected by permissions for any direct interaction.
- A report is marked `validated` by an explicit moderator/admin review action, recorded by `reviewed_by` and `reviewed_at`; there is no automatic threshold that silently validates a report.

## Fame rating proposal

This is intentionally not implemented yet. Proposed starting formula:

```text
fame = clamp(0, 100,
    30 * normalized_connections
  + 25 * normalized_likes_received
  + 20 * profile_completeness
  + 10 * message_response_score
  + 15 * safety_score
)
```

Notes:
- `normalized_connections` and `normalized_likes_received` are time-windowed to keep old activity from dominating forever.
- `profile_completeness` covers biography, photos, tags, and location completeness.
- `message_response_score` rewards active conversation participation.
- `safety_score` penalizes blocks and validated reports.
- `validated` means a human moderation action, not an auto-threshold trigger.
- Implement this only after you approve the formula and the weighting strategy.

## Seed data plan

- A management command will generate 500+ fake profiles using Faker.
- The seed script will create users, profiles, tags, blocks/reports where needed, and optional placeholder pictures.
- The command stays deterministic enough for repeatable local testing by accepting a seed value.
