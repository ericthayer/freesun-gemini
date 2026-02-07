/*
  # Create flight_logs and log_attachments tables

  1. New Tables
    - `flight_logs`
      - `id` (uuid, primary key)
      - `log_number` (text) - Display ID e.g. "841"
      - `date` (date) - Flight date
      - `duration_minutes` (integer) - Flight duration
      - `site` (text) - Landing/launch site name
      - `notes` (text) - Mission notes and observations
      - `status` (text) - "SIGNED OFF", "PENDING REVIEW", etc.
      - `created_at` (timestamptz)

    - `log_attachments`
      - `id` (uuid, primary key)
      - `flight_log_id` (uuid, FK to flight_logs) - Parent flight log
      - `url` (text) - Media URL
      - `type` (text) - "image", "video", etc.
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Read/write for anon and authenticated roles

  3. Seed Data
    - 2 flight logs (841 and 840)
    - 2 attachments for flight 841
*/

CREATE TABLE IF NOT EXISTS flight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_number text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes integer NOT NULL DEFAULT 60,
  site text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'PENDING REVIEW',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flight logs"
  ON flight_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert flight logs"
  ON flight_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update flight logs"
  ON flight_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete flight logs"
  ON flight_logs FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS log_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_log_id uuid NOT NULL REFERENCES flight_logs(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE log_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view log attachments"
  ON log_attachments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert log attachments"
  ON log_attachments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can delete log attachments"
  ON log_attachments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Seed flight logs and capture their IDs for attachments
DO $$
DECLARE
  log841_id uuid;
BEGIN
  INSERT INTO flight_logs (log_number, date, duration_minutes, site, notes, status)
  VALUES ('841', '2024-05-24', 105, 'Land Site Delta', 'Smooth landing, light crosswinds on approach.', 'SIGNED OFF')
  RETURNING id INTO log841_id;

  INSERT INTO flight_logs (log_number, date, duration_minutes, site, notes, status)
  VALUES ('840', '2024-05-23', 80, 'Valley Creek', 'Excellent visibility. Passengers enjoyed the vineyard tour.', 'SIGNED OFF');

  INSERT INTO log_attachments (flight_log_id, url, type) VALUES
    (log841_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200', 'image'),
    (log841_id, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200', 'image');
END $$;
