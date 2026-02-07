/*
  # Create checklists table

  1. New Tables
    - `checklists`
      - `id` (uuid, primary key)
      - `text` (text) - Checklist item description
      - `done` (boolean) - Completion status
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `checklists` table
    - Read/write access for anon and authenticated roles

  3. Seed Data
    - 8 pre-flight checklist items (3 done, 5 pending)
*/

CREATE TABLE IF NOT EXISTS checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view checklists"
  ON checklists FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert checklists"
  ON checklists FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update checklists"
  ON checklists FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete checklists"
  ON checklists FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO checklists (text, done, sort_order) VALUES
  ('Envelope Integrity Check', true, 1),
  ('Burner Test (Left & Right)', true, 2),
  ('Fuel Pressure Inspection', true, 3),
  ('Radio Communication Sync', false, 4),
  ('Landing Site Permission Verified', false, 5),
  ('Chase Vehicle Fuel Status', false, 6),
  ('Emergency Kit Inventory', false, 7),
  ('Pax Safety Briefing Signed', false, 8);
