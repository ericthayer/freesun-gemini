/*
  # Create events table

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text) - Event name
      - `date` (text) - Display date string e.g. "Dec 21, 2025"
      - `type` (text) - Event category e.g. "Flight Gala", "Social", "Training"
      - `description` (text) - Event description
      - `image_url` (text) - Event photo URL
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Read access for anon and authenticated (public events page)
    - Write access for anon and authenticated

  3. Seed Data
    - 3 events: Winter Solstice Ascension, Vintage Hangar Soiree, Rockies Safety Summit
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date text NOT NULL,
  type text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert events"
  ON events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update events"
  ON events FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete events"
  ON events FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO events (title, date, type, description, image_url) VALUES
  ('Winter Solstice Ascension', 'Dec 21, 2025', 'Flight Gala', 'Our largest member flight of the year followed by a bonfire at Field Base Alpha.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'),
  ('Vintage Hangar Soiree', 'Jan 15, 2026', 'Social', 'Cocktails and jazz among our restored 19th-century ballooning artifacts.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'),
  ('Rockies Safety Summit', 'Feb 05, 2026', 'Training', 'A full day of lectures from industry leaders on high-altitude recovery techniques.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800');
