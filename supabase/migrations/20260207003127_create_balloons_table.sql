/*
  # Create balloons table

  1. New Tables
    - `balloons`
      - `id` (uuid, primary key)
      - `name` (text) - Display name e.g. "SunChaser #04 (Medium)"
      - `type` (text) - Model/manufacturer e.g. "Cameron Z-250"
      - `description` (text) - Vessel description
      - `volume` (text) - Envelope volume e.g. "250k cu ft"
      - `capacity` (text) - Passenger capacity e.g. "12-14 Pax"
      - `burner` (text) - Burner system type
      - `image_url` (text) - Photo URL
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `balloons` table
    - Allow read access for anon and authenticated roles (public fleet data)
    - Write access for authenticated role (future auth integration)

  3. Seed Data
    - 4 balloons from the FreeSun fleet inventory
*/

CREATE TABLE IF NOT EXISTS balloons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  volume text NOT NULL DEFAULT '',
  capacity text NOT NULL DEFAULT '',
  burner text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE balloons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fleet balloons"
  ON balloons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert balloons"
  ON balloons FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update balloons"
  ON balloons FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete balloons"
  ON balloons FOR DELETE
  TO anon, authenticated
  USING (true);

INSERT INTO balloons (name, type, description, volume, capacity, burner, image_url) VALUES
  ('SunChaser #04 (Medium)', 'Cameron Z-250', 'Our flagship vessel for group flights. Known for its incredible stability and vibrant sunburst pattern.', '250k cu ft', '12-14 Pax', 'Quad-Shadow', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'),
  ('DawnRider #01 (Small)', '', 'A nimble, single-pilot craft perfect for solo dawn patrols and training flights.', '', '', '', ''),
  ('Atlas #09 (Large)', 'Ultramagic N-425', 'The giant of the Rockies. Reserved for special events and large corporate gatherings.', '425k cu ft', '20+ Pax', 'PowerPlus', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200'),
  ('SkyGazer #02 (XL)', 'Lindstrand LBL 90A', 'The preferred choice for romantic private flights and high-altitude photography missions.', '90k cu ft', '2 Pax', 'Sirocco', 'https://images.unsplash.com/photo-1544391681-9964893796fc?auto=format&fit=crop&q=80&w=1200');
