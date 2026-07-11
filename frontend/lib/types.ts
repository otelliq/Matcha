// API Response Types
export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiError;
}

// Auth Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: "unset" | "male" | "female" | "non_binary" | "other";
  sexual_preference: "straight" | "gay" | "lesbian" | "bisexual" | "asexual";
  biography?: string;
  date_of_birth?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  neighborhood?: string;
  location_source?: "gps" | "manual";
  fame_rating?: string;
  fame_rating_components?: Record<string, unknown>;
  fame_rating_recalculated_at?: string | null;
  last_seen_at?: string | null;
  tags: Tag[];
  pictures: Picture[];
  email_verified_at?: string | null;
  date_joined?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Picture {
  id: number;
  image_url: string;
  is_primary: boolean;
  position: number;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface RegisterResponse {
  user: Omit<User, "tags" | "pictures">;
  verification_sent: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// Profile Types
export interface PublicProfile extends Omit<User, "email" | "email_verified_at"> {
  distance_km?: number;
  shared_tags_count?: number;
  match_score?: number;
  same_area?: boolean;
}

export interface ProfileViewer {
  profile: PublicProfile;
  timestamp: string;
}

export interface ProfileViewersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfileViewer[];
}

// Chat Types
export interface Message {
  id: number;
  connection: number;
  sender: number;
  sender_username: string;
  body: string;
  read_at?: string | null;
  delivered_at: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  connection_id: number;
  profile: PublicProfile;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface MessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

export interface ChatSocketMessage {
  body: string;
}

export interface ChatSocketReceive extends Message {}

// Notification Types
export type NotificationKind =
  | "profile_liked"
  | "profile_viewed"
  | "message_received"
  | "mutual_like"
  | "unliked";

export interface Notification {
  id: number;
  recipient: number;
  actor: number;
  actor_username: string;
  kind: NotificationKind;
  data: Record<string, unknown>;
  read_at?: string | null;
  delivered_at: string;
  created_at: string;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface NotificationSocketMessage extends Notification {}

// Matching Types
export interface SuggestionsQuery {
  sort?: "same_area" | "distance" | "fame" | "recent" | "shared_tags";
  "filter[age_min]"?: number;
  "filter[age_max]"?: number;
  "filter[fame_min]"?: number;
  "filter[fame_max]"?: number;
  "filter[city]"?: string;
  "filter[neighborhood]"?: string;
  "filter[latitude]"?: number;
  "filter[longitude]"?: number;
  "filter[radius_km]"?: number;
  "filter[tags]"?: string | string[];
  limit?: number;
  offset?: number;
}

export interface ProfilesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PublicProfile[];
}

// Interaction Types
export interface Like {
  id: number;
  liker: number;
  liked: number;
  created_at: string;
  is_active: boolean;
}

export interface Connection {
  id: number;
  profile: PublicProfile;
  created_at: string;
  closed_at?: string | null;
}

export interface LikeResponse {
  like: Like;
  connection_created: boolean;
  connection: Connection | null;
}

export interface Block {
  id: number;
  blocker: number;
  blocked: number;
  created_at: string;
  is_active: boolean;
}

export interface BlockResponse {
  block: Block;
  disconnected: boolean;
}

export interface Report {
  id: number;
  reporter: number;
  reported: number;
  reason: string;
  details?: string;
  created_at: string;
}

export interface ReportRequest {
  reason: "fake_profile" | "abuse" | "other";
  details?: string;
}

export interface ReportResponse {
  report: Report;
}

export interface ConnectionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Connection[];
}

// Pagination
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
