-- ==========================================
-- TORNEO SINGOLO COMPLETO - ESEMPIO
-- ==========================================
-- Questo script popola UN TORNEO con tutti i dati:
-- - Creazione torneo (status: Completato)
-- - 3 gironi con 5 squadre ciascuno
-- - Tutte le partite completate
-- - Stats aggiornate
-- - Bracket GOLD/SILVER con semifinali, finali e 3° posto
-- - Podium per entrambi i bracket
--
-- Modifica i valori sottostanti per creare il tuo torneo
-- ==========================================

-- ====================
-- VALORI CONFIGURABILI
-- ====================
-- Modifica questi ID secondo i tuoi dati:
-- - TOURNAMENT_ID: ID del torneo da popolare (es. 8)
-- - GROUP_IDS: IDs dei 3 gironi (es. 22, 23, 24)
-- - TEAM_IDS: IDs delle 15 squadre (es. 73-87)

-- Assicurati che il torneo e i gironi/squadre esistano già!
-- Se no, usare i dati di esempio che trovi più sotto

-- ==========================================
-- CREAZIONE DATI DI ESEMPIO (OPZIONALE)
-- ==========================================
-- Scommenta se necessario: creerà torneo 8, gironi 22-24, squadre 73-87

/*
-- Crea Torneo 8
INSERT INTO tournaments (name, status, sport_type, date_start, date_end, location)
VALUES ('Torneo Completo Esempio', 'Completato', 'beach_volley', '2026-03-15', '2026-03-17', 'Spiaggia Centro')
ON CONFLICT DO NOTHING;

-- Crea 3 gironi per Torneo 8
INSERT INTO groups (name, tournament_id, sport_type, status)
VALUES 
  ('Girone A', 8, 'beach_volley', 'completed'),
  ('Girone B', 8, 'beach_volley', 'completed'),
  ('Girone C', 8, 'beach_volley', 'completed')
ON CONFLICT DO NOTHING;

-- Crea 15 squadre (5 per girone x 3 gironi)
INSERT INTO registered_teams (tournament_id, group_id, team_name, player1_name, player2_name)
VALUES
  (8, 22, 'Rossi-Bianchi', 'Marco Rossi', 'Luca Bianchi'),
  (8, 22, 'Verdi-Neri', 'Antonio Verdi', 'Fabio Neri'),
  (8, 22, 'Gialli-Blu', 'Giovanni Gialli', 'Salvatore Blu'),
  (8, 22, 'Viola-Rosa', 'Andrea Viola', 'Roberto Rosa'),
  (8, 22, 'Arancio-Marrone', 'Matteo Arancio', 'Stefano Marrone'),
  
  (8, 23, 'Azzurro-Grigio', 'Raffaele Azzurro', 'Lorenzo Grigio'),
  (8, 23, 'Beige-Cremisi', 'Luca Beige', 'Marco Cremisi'),
  (8, 23, 'Corallo-Dorato', 'Fabio Corallo', 'Giovanni Dorato'),
  (8, 23, 'Ebano-Fragola', 'Salvatore Ebano', 'Antonio Fragola'),
  (8, 23, 'Garofano-Indaco', 'Matteo Garofano', 'Stefano Indaco'),
  
  (8, 24, 'Jade-Kaki', 'Andrea Jade', 'Roberto Kaki'),
  (8, 24, 'Lavanda-Magenta', 'Luca Lavanda', 'Marco Magenta'),
  (8, 24, 'Nero-Oliva', 'Fabio Nero', 'Giovanni Oliva'),
  (8, 24, 'Pesca-Quarzo', 'Salvatore Pesca', 'Antonio Quarzo'),
  (8, 24, 'Rosato-Sabbia', 'Matteo Rosato', 'Stefano Sabbia')
ON CONFLICT DO NOTHING;

-- Crea 30 match per i 3 gironi (10 per girone)
-- Girone A (Girone 22)
INSERT INTO matches (tournament_id, group_id, team1_id, team2_id, team1_name, team2_name, status)
SELECT 8, 22, rt1.id, rt2.id, rt1.team_name, rt2.team_name, 'pending'
FROM registered_teams rt1, registered_teams rt2
WHERE rt1.tournament_id = 8 AND rt2.tournament_id = 8 
  AND rt1.group_id = 22 AND rt2.group_id = 22
  AND rt1.id < rt2.id
ON CONFLICT DO NOTHING;

-- Girone B (Girone 23)
INSERT INTO matches (tournament_id, group_id, team1_id, team2_id, team1_name, team2_name, status)
SELECT 8, 23, rt1.id, rt2.id, rt1.team_name, rt2.team_name, 'pending'
FROM registered_teams rt1, registered_teams rt2
WHERE rt1.tournament_id = 8 AND rt2.tournament_id = 8 
  AND rt1.group_id = 23 AND rt2.group_id = 23
  AND rt1.id < rt2.id
ON CONFLICT DO NOTHING;

-- Girone C (Girone 24)
INSERT INTO matches (tournament_id, group_id, team1_id, team2_id, team1_name, team2_name, status)
SELECT 8, 24, rt1.id, rt2.id, rt1.team_name, rt2.team_name, 'pending'
FROM registered_teams rt1, registered_teams rt2
WHERE rt1.tournament_id = 8 AND rt2.tournament_id = 8 
  AND rt1.group_id = 24 AND rt2.group_id = 24
  AND rt1.id < rt2.id
ON CONFLICT DO NOTHING;
*/

-- ==========================================
-- COMPLETA TUTTI I MATCH - GIRONE A
-- ==========================================
-- Modifica i team_name secondo i tuoi dati
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Rossi-Bianchi' AND team2_name = 'Verdi-Neri';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 14 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Rossi-Bianchi' AND team2_name = 'Gialli-Blu';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 19 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Rossi-Bianchi' AND team2_name = 'Viola-Rosa';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 16 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Rossi-Bianchi' AND team2_name = 'Arancio-Marrone';
UPDATE matches SET status = 'completed', team1_score = 20, team2_score = 21 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Verdi-Neri' AND team2_name = 'Gialli-Blu';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 18 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Verdi-Neri' AND team2_name = 'Viola-Rosa';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 15 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Verdi-Neri' AND team2_name = 'Arancio-Marrone';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Gialli-Blu' AND team2_name = 'Viola-Rosa';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 13 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Gialli-Blu' AND team2_name = 'Arancio-Marrone';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 12 WHERE tournament_id = 8 AND group_id = 22 AND team1_name = 'Viola-Rosa' AND team2_name = 'Arancio-Marrone';

-- Aggiorna stats Girone A
UPDATE registered_teams SET points = 30, matches_played = 4, wins = 4, losses = 0, sets_won = 8, sets_lost = 1 WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi';
UPDATE registered_teams SET points = 22, matches_played = 4, wins = 3, losses = 1, sets_won = 7, sets_lost = 2 WHERE tournament_id = 8 AND team_name = 'Verdi-Neri';
UPDATE registered_teams SET points = 20, matches_played = 4, wins = 2, losses = 2, sets_won = 6, sets_lost = 3 WHERE tournament_id = 8 AND team_name = 'Gialli-Blu';
UPDATE registered_teams SET points = 10, matches_played = 4, wins = 1, losses = 3, sets_won = 4, sets_lost = 5 WHERE tournament_id = 8 AND team_name = 'Viola-Rosa';
UPDATE registered_teams SET points = 0, matches_played = 4, wins = 0, losses = 4, sets_won = 1, sets_lost = 8 WHERE tournament_id = 8 AND team_name = 'Arancio-Marrone';

-- ==========================================
-- COMPLETA TUTTI I MATCH - GIRONE B
-- ==========================================
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 18 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Azzurro-Grigio' AND team2_name = 'Beige-Cremisi';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Azzurro-Grigio' AND team2_name = 'Corallo-Dorato';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 16 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Azzurro-Grigio' AND team2_name = 'Ebano-Fragola';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 15 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Azzurro-Grigio' AND team2_name = 'Garofano-Indaco';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 19 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Beige-Cremisi' AND team2_name = 'Corallo-Dorato';
UPDATE matches SET status = 'completed', team1_score = 20, team2_score = 21 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Beige-Cremisi' AND team2_name = 'Ebano-Fragola';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 18 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Beige-Cremisi' AND team2_name = 'Garofano-Indaco';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Corallo-Dorato' AND team2_name = 'Ebano-Fragola';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 14 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Corallo-Dorato' AND team2_name = 'Garofano-Indaco';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 16 WHERE tournament_id = 8 AND group_id = 23 AND team1_name = 'Ebano-Fragola' AND team2_name = 'Garofano-Indaco';

-- Aggiorna stats Girone B
UPDATE registered_teams SET points = 30, matches_played = 4, wins = 4, losses = 0, sets_won = 8, sets_lost = 1 WHERE tournament_id = 8 AND team_name = 'Azzurro-Grigio';
UPDATE registered_teams SET points = 22, matches_played = 4, wins = 3, losses = 1, sets_won = 7, sets_lost = 2 WHERE tournament_id = 8 AND team_name = 'Beige-Cremisi';
UPDATE registered_teams SET points = 20, matches_played = 4, wins = 2, losses = 2, sets_won = 6, sets_lost = 3 WHERE tournament_id = 8 AND team_name = 'Corallo-Dorato';
UPDATE registered_teams SET points = 12, matches_played = 4, wins = 1, losses = 3, sets_won = 4, sets_lost = 5 WHERE tournament_id = 8 AND team_name = 'Ebano-Fragola';
UPDATE registered_teams SET points = 0, matches_played = 4, wins = 0, losses = 4, sets_won = 2, sets_lost = 8 WHERE tournament_id = 8 AND team_name = 'Garofano-Indaco';

-- ==========================================
-- COMPLETA TUTTI I MATCH - GIRONE C
-- ==========================================
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Jade-Kaki' AND team2_name = 'Lavanda-Magenta';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 18 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Jade-Kaki' AND team2_name = 'Nero-Oliva';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 16 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Jade-Kaki' AND team2_name = 'Pesca-Quarzo';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 15 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Jade-Kaki' AND team2_name = 'Rosato-Sabbia';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 19 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Lavanda-Magenta' AND team2_name = 'Nero-Oliva';
UPDATE matches SET status = 'completed', team1_score = 20, team2_score = 21 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Lavanda-Magenta' AND team2_name = 'Pesca-Quarzo';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 17 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Lavanda-Magenta' AND team2_name = 'Rosato-Sabbia';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 18 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Nero-Oliva' AND team2_name = 'Pesca-Quarzo';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 14 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Nero-Oliva' AND team2_name = 'Rosato-Sabbia';
UPDATE matches SET status = 'completed', team1_score = 21, team2_score = 16 WHERE tournament_id = 8 AND group_id = 24 AND team1_name = 'Pesca-Quarzo' AND team2_name = 'Rosato-Sabbia';

-- Aggiorna stats Girone C
UPDATE registered_teams SET points = 30, matches_played = 4, wins = 4, losses = 0, sets_won = 8, sets_lost = 1 WHERE tournament_id = 8 AND team_name = 'Jade-Kaki';
UPDATE registered_teams SET points = 22, matches_played = 4, wins = 3, losses = 1, sets_won = 7, sets_lost = 2 WHERE tournament_id = 8 AND team_name = 'Lavanda-Magenta';
UPDATE registered_teams SET points = 20, matches_played = 4, wins = 2, losses = 2, sets_won = 6, sets_lost = 3 WHERE tournament_id = 8 AND team_name = 'Nero-Oliva';
UPDATE registered_teams SET points = 10, matches_played = 4, wins = 1, losses = 3, sets_won = 4, sets_lost = 5 WHERE tournament_id = 8 AND team_name = 'Pesca-Quarzo';
UPDATE registered_teams SET points = 0, matches_played = 4, wins = 0, losses = 4, sets_won = 1, sets_lost = 8 WHERE tournament_id = 8 AND team_name = 'Rosato-Sabbia';

-- ==========================================
-- GENERA BRACKET GOLD
-- ==========================================
-- Top 2 squadre per girone: Rossi-Bianchi vs Azzurro-Grigio (semifinal 1)
-- Top 2 squadre per girone: Jade-Kaki vs Verdi-Neri (semifinal 2)
WITH inserted_bracket AS (
  INSERT INTO tournament_brackets (tournament_id, bracket_type, status) 
  VALUES (8, 'GOLD', 'completed')
  ON CONFLICT (tournament_id, bracket_type) DO UPDATE SET status = 'completed'
  RETURNING id
)
INSERT INTO knockout_matches (bracket_id, tournament_id, round, team1_id, team2_id, team1_name, team2_name, team1_score, team2_score, winner_id, status) 
SELECT 
  ib.id, 8, 'SEMIFINAL', 
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Azzurro-Grigio' LIMIT 1),
  'Rossi-Bianchi', 'Azzurro-Grigio', 21, 19, 
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'SEMIFINAL', 
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Jade-Kaki' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Verdi-Neri' LIMIT 1),
  'Jade-Kaki', 'Verdi-Neri', 21, 17,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Jade-Kaki' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'FINAL',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Jade-Kaki' LIMIT 1),
  'Rossi-Bianchi', 'Jade-Kaki', 21, 18,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'THIRD_PLACE',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Azzurro-Grigio' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Verdi-Neri' LIMIT 1),
  'Azzurro-Grigio', 'Verdi-Neri', 21, 16,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Azzurro-Grigio' LIMIT 1), 
  'completed'
FROM inserted_bracket ib;

-- Crea PODIO GOLD
INSERT INTO tournament_podium (tournament_id, bracket_type, position, team_id, team_name, player1_name, player2_name) 
SELECT 
  8, 'GOLD', 1, 
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Rossi-Bianchi' LIMIT 1),
  'Rossi-Bianchi', 'Marco Rossi', 'Luca Bianchi'
UNION ALL
SELECT 
  8, 'GOLD', 2,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Jade-Kaki' LIMIT 1),
  'Jade-Kaki', 'Andrea Jade', 'Roberto Kaki'
UNION ALL
SELECT 
  8, 'GOLD', 3,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Azzurro-Grigio' LIMIT 1),
  'Azzurro-Grigio', 'Raffaele Azzurro', 'Lorenzo Grigio';

-- ==========================================
-- GENERA BRACKET SILVER
-- ==========================================
-- 3° posto per girone (Gialli-Blu vs Beige-Cremisi vs Nero-Oliva)
WITH inserted_bracket AS (
  INSERT INTO tournament_brackets (tournament_id, bracket_type, status) 
  VALUES (8, 'SILVER', 'completed')
  ON CONFLICT (tournament_id, bracket_type) DO UPDATE SET status = 'completed'
  RETURNING id
)
INSERT INTO knockout_matches (bracket_id, tournament_id, round, team1_id, team2_id, team1_name, team2_name, team1_score, team2_score, winner_id, status) 
SELECT 
  ib.id, 8, 'SEMIFINAL',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Gialli-Blu' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Beige-Cremisi' LIMIT 1),
  'Gialli-Blu', 'Beige-Cremisi', 21, 18,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Gialli-Blu' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'SEMIFINAL',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Nero-Oliva' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Corallo-Dorato' LIMIT 1),
  'Nero-Oliva', 'Corallo-Dorato', 21, 19,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Nero-Oliva' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'FINAL',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Gialli-Blu' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Nero-Oliva' LIMIT 1),
  'Gialli-Blu', 'Nero-Oliva', 21, 17,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Gialli-Blu' LIMIT 1), 
  'completed'
FROM inserted_bracket ib
UNION ALL
SELECT 
  ib.id, 8, 'THIRD_PLACE',
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Beige-Cremisi' LIMIT 1),
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Corallo-Dorato' LIMIT 1),
  'Beige-Cremisi', 'Corallo-Dorato', 21, 15,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Beige-Cremisi' LIMIT 1), 
  'completed'
FROM inserted_bracket ib;

-- Crea PODIO SILVER
INSERT INTO tournament_podium (tournament_id, bracket_type, position, team_id, team_name, player1_name, player2_name) 
SELECT 
  8, 'SILVER', 1,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Gialli-Blu' LIMIT 1),
  'Gialli-Blu', 'Giovanni Gialli', 'Salvatore Blu'
UNION ALL
SELECT 
  8, 'SILVER', 2,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Nero-Oliva' LIMIT 1),
  'Nero-Oliva', 'Fabio Nero', 'Giovanni Oliva'
UNION ALL
SELECT 
  8, 'SILVER', 3,
  (SELECT id FROM registered_teams WHERE tournament_id = 8 AND team_name = 'Beige-Cremisi' LIMIT 1),
  'Beige-Cremisi', 'Luca Beige', 'Marco Cremisi';

-- ==========================================
-- VERIFICA FINALE
-- ==========================================
SELECT '✅ Torneo Completo Popcolato!' as STATUS;
SELECT 
  t.id,
  t.name,
  t.status,
  COUNT(DISTINCT g.id) as GIRONI,
  COUNT(DISTINCT rt.id) as SQUADRE,
  SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) as PARTITE_COMPLETATE,
  COUNT(DISTINCT tb.id) as BRACKET,
  COUNT(DISTINCT tp.id) as PODIUM
FROM tournaments t
LEFT JOIN groups g ON g.tournament_id = t.id
LEFT JOIN registered_teams rt ON rt.tournament_id = t.id
LEFT JOIN matches m ON m.tournament_id = t.id
LEFT JOIN tournament_brackets tb ON tb.tournament_id = t.id
LEFT JOIN tournament_podium tp ON tp.tournament_id = t.id
WHERE t.id = 8
GROUP BY t.id, t.name, t.status;
