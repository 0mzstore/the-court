// Hand-written for now. Once Supabase is connected, regenerate with:
//   npx supabase gen types typescript --project-id <your-project-id> > lib/types/database.ts
// and this file becomes auto-maintained instead of hand-maintained.

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type Role = "player" | "admin";
export type RegistrationStatus =
  | "registered"
  | "waiting_list"
  | "confirmed"
  | "checked_in"
  | "no_show"
  | "cancelled";
export type MatchResult = "A" | "B" | "draw";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  gender: "male" | "female" | null;
  skill_level: SkillLevel;
  role: Role;
  created_at: string;
}

export interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PlayerSeasonStats {
  id: string;
  player_id: string;
  season_id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  sessions_attended: number;
  points_for: number;
  points_against: number;
}

export interface Session {
  id: string;
  season_id: string;
  title: string;
  session_date: string;
  status: "upcoming" | "attendance_open" | "in_progress" | "completed";
  created_by: string;
  created_at: string;
}

export interface SessionLocation {
  id: string;
  session_id: string;
  name: string;
  courts_count: number;
  first_match_time: string | null;
  match_minutes: number;
  rest_minutes: number;
  rounds_count: number;
  status: "attendance" | "schedule" | "completed";
}

export interface SessionRegistration {
  id: string;
  session_id: string;
  location_id: string | null;
  player_id: string;
  status: RegistrationStatus;
  registered_at: string;
  checked_in_at: string | null;
  position_in_queue: number | null;
  confirmation_expires_at: string | null;
}

export interface Match {
  id: string;
  round_id: string;
  court_number: number;
  team_a: string[];
  team_b: string[];
  score_a: number | null;
  score_b: number | null;
  result: MatchResult | null;
  recorded_by: string | null;
  recorded_at: string | null;
}

export interface Round {
  id: string;
  location_id: string;
  round_number: number;
  created_at: string;
}

export interface Payment {
  id: string;
  player_id: string;
  session_id: string | null;
  amount: number;
  currency: string;
  method: string | null;
  status: "pending" | "paid" | "refunded";
  paid_at: string | null;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  tier: "gold" | "silver" | "bronze" | null;
  website_url: string | null;
  active: boolean;
}

export interface Reward {
  id: string;
  season_id: string | null;
  title: string;
  description: string | null;
  sponsor_id: string | null;
  image_url: string | null;
  awarded_to: string | null;
  awarded_at: string | null;
}

export interface Notification {
  id: string;
  player_id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export interface CmsContent {
  key: string;
  content: Record<string, unknown>;
  updated_at: string;
}

// Minimal Supabase Database type shape so createBrowserClient/createServerClient
// stay type-safe. Expand as tables are finalized in supabase/migrations.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      seasons: { Row: Season; Insert: Partial<Season>; Update: Partial<Season> };
      player_season_stats: {
        Row: PlayerSeasonStats;
        Insert: Partial<PlayerSeasonStats>;
        Update: Partial<PlayerSeasonStats>;
      };
      sessions: { Row: Session; Insert: Partial<Session>; Update: Partial<Session> };
      session_locations: {
        Row: SessionLocation;
        Insert: Partial<SessionLocation>;
        Update: Partial<SessionLocation>;
      };
      session_registrations: {
        Row: SessionRegistration;
        Insert: Partial<SessionRegistration>;
        Update: Partial<SessionRegistration>;
      };
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> };
      rounds: { Row: Round; Insert: Partial<Round>; Update: Partial<Round> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      sponsors: { Row: Sponsor; Insert: Partial<Sponsor>; Update: Partial<Sponsor> };
      rewards: { Row: Reward; Insert: Partial<Reward>; Update: Partial<Reward> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      cms_content: { Row: CmsContent; Insert: Partial<CmsContent>; Update: Partial<CmsContent> };
    };
  };
}
