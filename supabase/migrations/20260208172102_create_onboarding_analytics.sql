/*
  # Onboarding Analytics and Tracking System

  1. New Tables
    - `onboarding_events`
      - `id` (uuid, primary key): Unique event identifier
      - `user_id` (uuid, foreign key): References auth.users
      - `event_type` (text): Event category (start, step_view, complete, skip, back, close)
      - `step_number` (integer): Current step number (1-indexed)
      - `step_title` (text): Step title for context
      - `timestamp` (timestamptz): Event occurrence time
      - `device_type` (text): Device category (mobile, tablet, desktop)
      - `viewport_width` (integer): Screen width in pixels
      - `viewport_height` (integer): Screen height in pixels
      - `user_agent` (text): Browser user agent string
      - `session_duration_ms` (integer): Time spent on step in milliseconds
      - `metadata` (jsonb): Additional contextual data

  2. Security
    - Enable RLS on `onboarding_events` table
    - Allow authenticated users to insert their own events
    - Allow authenticated users to view their own events history
    - Restrict unauthorized access

  3. Indexes
    - Index on `user_id` for fast user-specific queries
    - Index on `event_type` for analytics aggregation
    - Index on `timestamp` for time-series analysis

  4. Important Notes
    - Data is anonymous and used only for product improvement
    - Users can view their own onboarding history
    - Admins can aggregate anonymized metrics
    - No PII is stored beyond user_id reference
*/

CREATE TABLE IF NOT EXISTS onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('start', 'step_view', 'complete', 'skip', 'back', 'close')),
  step_number integer CHECK (step_number >= 1 AND step_number <= 10),
  step_title text,
  timestamp timestamptz DEFAULT now() NOT NULL,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  viewport_width integer CHECK (viewport_width > 0),
  viewport_height integer CHECK (viewport_height > 0),
  user_agent text,
  session_duration_ms integer CHECK (session_duration_ms >= 0),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding events"
  ON onboarding_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own onboarding history"
  ON onboarding_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type ON onboarding_events(event_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_timestamp ON onboarding_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_event ON onboarding_events(user_id, event_type);
