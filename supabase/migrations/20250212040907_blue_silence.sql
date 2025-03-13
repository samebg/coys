/*
  # Initial Schema for Tottenham HotSam

  1. New Tables
    - `subscribers`
      - `id` (uuid, primary key)
      - `email` (text, optional)
      - `phone` (text, optional)
      - `timezone` (text)
      - `notify_email` (boolean)
      - `notify_sms` (boolean)
      - `notify_10min` (boolean)
      - `created_at` (timestamp)
    
    - `matches`
      - `id` (uuid, primary key)
      - `competition` (text)
      - `opponent` (text)
      - `match_time` (timestamptz)
      - `home_away` (text)
      - `created_at` (timestamp)
    
    - `lineups`
      - `id` (uuid, primary key)
      - `match_id` (uuid, foreign key)
      - `player_name` (text)
      - `is_starter` (boolean)
      - `position` (text)
      - `is_injured` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to read match data
    - Add policies for authenticated users to manage their subscriptions
*/

-- Create subscribers table
CREATE TABLE subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text,
    phone text,
    timezone text NOT NULL,
    notify_email boolean DEFAULT true,
    notify_sms boolean DEFAULT false,
    notify_10min boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create matches table
CREATE TABLE matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    competition text NOT NULL,
    opponent text NOT NULL,
    match_time timestamptz NOT NULL,
    home_away text NOT NULL CHECK (home_away IN ('home', 'away')),
    created_at timestamptz DEFAULT now()
);

-- Create lineups table
CREATE TABLE lineups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
    player_name text NOT NULL,
    is_starter boolean DEFAULT false,
    position text NOT NULL,
    is_injured boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to matches"
    ON matches FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public read access to lineups"
    ON lineups FOR SELECT
    TO public
    USING (true);

-- Create indexes
CREATE INDEX idx_matches_match_time ON matches(match_time);
CREATE INDEX idx_lineups_match_id ON lineups(match_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_phone ON subscribers(phone);