/*
  # Add sample match data

  1. New Data
    - Adds sample upcoming matches for Tottenham
    - Adds sample lineup data for the matches
  
  2. Changes
    - Inserts sample data into matches and lineups tables
*/

-- Insert sample matches
INSERT INTO matches (competition, opponent, match_time, home_away)
VALUES
  ('Premier League', 'Arsenal', '2025-03-02 15:30:00+00', 'home'),
  ('FA Cup', 'Manchester United', '2025-03-16 20:00:00+00', 'away'),
  ('Premier League', 'Liverpool', '2025-03-30 16:00:00+00', 'home');

-- Insert sample lineups for the first match
WITH first_match AS (
  SELECT id FROM matches WHERE opponent = 'Arsenal' LIMIT 1
)
INSERT INTO lineups (match_id, player_name, is_starter, position, is_injured)
SELECT 
  first_match.id,
  player_name,
  is_starter,
  position,
  is_injured
FROM first_match,
(VALUES
  ('Guglielmo Vicario', true, 'Goalkeeper', false),
  ('Pedro Porro', true, 'Defender', false),
  ('Cristian Romero', true, 'Defender', false),
  ('Micky van de Ven', true, 'Defender', false),
  ('Destiny Udogie', true, 'Defender', false),
  ('Yves Bissouma', true, 'Midfielder', false),
  ('Rodrigo Bentancur', true, 'Midfielder', false),
  ('James Maddison', true, 'Midfielder', false),
  ('Dejan Kulusevski', true, 'Forward', false),
  ('Richarlison', true, 'Forward', false),
  ('Son Heung-min', true, 'Forward', false),
  ('Fraser Forster', false, 'Goalkeeper', false),
  ('Emerson Royal', false, 'Defender', false),
  ('Ben Davies', false, 'Defender', false),
  ('Oliver Skipp', false, 'Midfielder', false),
  ('Bryan Gil', false, 'Forward', true),
  ('Brennan Johnson', false, 'Forward', false)
) AS players(player_name, is_starter, position, is_injured);