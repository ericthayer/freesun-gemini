/*
  # Create schedule_items table

  1. New Tables
    - `schedule_items`
      - `id` (uuid, primary key)
      - `type` (text) - "flight", "training", "social", "meeting"
      - `title` (text) - Assignment title
      - `date` (date) - Scheduled date
      - `time` (text) - Scheduled time e.g. "06:15"
      - `location` (text) - Launch/meeting site
      - `description` (text) - Mission brief
      - `attendees` (integer) - Number of attendees/passengers
      - `requires_crew` (boolean) - Whether ground crew is needed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `schedule_items` table
    - Read/write access for anon and authenticated roles

  3. Seed Data
    - 1 flight assignment: Valley Mist Morning Ride
*/

CREATE TABLE IF NOT EXISTS schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'flight',
  title text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  attendees integer NOT NULL DEFAULT 0,
  requires_crew boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedule items"
  ON schedule_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert schedule items"
  ON schedule_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update schedule items"
  ON schedule_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete schedule items"
  ON schedule_items FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO schedule_items (type, title, date, time, location, description, attendees) VALUES
  ('flight', 'Valley Mist Morning Ride', '2026-01-13', '06:15', 'South Ridge Launch Site', 'Standard tourist flight for 4 passengers. Ground crew arrival at 05:30 for cold inflation.', 4);
