/*
  # Create crew_members table

  1. New Tables
    - `crew_members`
      - `id` (uuid, primary key)
      - `name` (text) - Full name with optional callsign
      - `role` (text) - "Pilot" or "Ground Crew"
      - `experience_years` (integer) - Years of experience
      - `email` (text) - Contact email
      - `phone` (text) - Contact phone
      - `certifications` (text[]) - Array of certification names
      - `bio` (text) - Short biography
      - `image_url` (text) - Profile photo URL
      - `availability` (text) - "available" or "busy"
      - `specialty` (text) - Core specialization area
      - `flights` (integer) - Total logged flight hours/missions
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `crew_members` table
    - Read access for anon and authenticated (public crew directory)
    - Write access for anon and authenticated (profile updates from dashboards)

  3. Seed Data
    - 9 crew members (unified from CrewShowcase, Dashboard, and CrewDashboard)
    - 2 Pilots: Sarah "Sky" Miller, David Thorne
    - 7 Ground Crew: Mike Chen, Elena Rodriguez, Tom Wilson, Linda Gao, James Peterson, Sofia Rossi, Marcus Wright
*/

CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Ground Crew',
  experience_years integer NOT NULL DEFAULT 0,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  certifications text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT 'available',
  specialty text NOT NULL DEFAULT '',
  flights integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crew members"
  ON crew_members FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert crew members"
  ON crew_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update crew members"
  ON crew_members FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete crew members"
  ON crew_members FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO crew_members (name, role, experience_years, email, phone, certifications, bio, image_url, availability, specialty, flights) VALUES
  ('Sarah "Sky" Miller', 'Pilot', 12, 'sarah@freesun.net', '+1 555-0101', ARRAY['Commercial LTA License', 'Flight Instructor', 'Night Rating'], 'Sarah is the club chief pilot, specializing in long-distance valley traverses and high-altitude weather pattern recognition.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800', 'available', 'High Altitude Navigation', 1540),
  ('David Thorne', 'Pilot', 20, 'thorne@freesun.net', '+1 555-0103', ARRAY['Master Pilot LTA', 'Maintenance Technician'], 'A master of the mountain winds, David has navigated nearly every peak in the Rockies and leads our safety training seminars.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800', 'available', 'Emergency Recovery', 2800),
  ('Mike Chen', 'Ground Crew', 5, 'mike@freesun.net', '+1 555-0102', ARRAY['Crew Chief Certified', 'Emergency Response'], 'Mike ensures the technical readiness of every envelope before dawn breaks.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600', 'busy', 'Cold Inflation Lead', 420),
  ('Elena Rodriguez', 'Ground Crew', 3, 'elena@freesun.net', '+1 555-0104', ARRAY['Recovery Specialist', 'Radio Communications'], 'Elena is the best in the business at predicting landing zones and leading recovery vehicles through rough terrain.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', 'available', 'Chase Navigation', 210),
  ('Tom Wilson', 'Ground Crew', 8, '', '', '{}', 'Tom keeps the fire going, literally. He oversees our maintenance hangar with surgical precision.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600', 'available', 'Burner Maintenance', 680),
  ('Linda Gao', 'Ground Crew', 4, '', '', '{}', 'Linda ensures that every guest feels safe and informed from pre-flight to landing toast.', 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=600', 'available', 'Passenger Safety', 315),
  ('James Peterson', 'Ground Crew', 6, '', '', '{}', 'James manages our workshop, ensuring the integrity of every square inch of silk in the hangar.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600', 'available', 'Envelope Repair', 550),
  ('Sofia Rossi', 'Ground Crew', 2, '', '', '{}', 'Sofia coordinates the complex dance between pilots, ground crew, and local field permits.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600', 'available', 'Logistics Liaison', 145),
  ('Marcus Wright', 'Ground Crew', 10, '', '', '{}', 'A veteran of the ground operations, Marcus oversees the workflow of our field base teams.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600', 'available', 'Team Coordination', 920);
