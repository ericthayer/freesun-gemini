/*
  # Create maintenance_logs table

  1. New Tables
    - `maintenance_logs`
      - `id` (uuid, primary key)
      - `balloon_name` (text) - Balloon display name
      - `date` (date) - Service date
      - `service_type` (text) - Type of service performed
      - `parts_used` (text) - Parts consumed during service
      - `notes` (text) - Technician notes
      - `technician` (text) - Performing technician name
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `maintenance_logs` table
    - Read/write access for anon and authenticated roles

  3. Seed Data
    - 2 maintenance entries:
      - 100-Hour Inspection on SunChaser #04 (Pilot dashboard)
      - Wicker Reseal on SunChaser #04 (Crew dashboard)
*/

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  balloon_name text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  service_type text NOT NULL DEFAULT '',
  parts_used text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  technician text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view maintenance logs"
  ON maintenance_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "App users can insert maintenance logs"
  ON maintenance_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "App users can update maintenance logs"
  ON maintenance_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "App users can delete maintenance logs"
  ON maintenance_logs FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO maintenance_logs (balloon_name, date, service_type, parts_used, notes, technician) VALUES
  ('SunChaser #04 (Medium)', '2024-05-15', '100-Hour Inspection', 'Burner hoses, load ring gaskets', 'Structural integrity verified. Fuel pressure optimal at all ports.', 'Sarah Miller'),
  ('SunChaser #04 (Medium)', '2024-05-15', 'Wicker Reseal', 'Varnish, rattan weave repair kit', 'Standard seasonal touchup on lower basket structural elements.', 'Elena Rodriguez');
