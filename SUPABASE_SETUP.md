# Setup Supabase per Beach Volley Tournament Manager

## Istruzioni di Setup

### 1. Creare un progetto Supabase
1. Vai a [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Anota la URL e la chiave API

### 2. Eseguire lo schema SQL
1. Vai in **SQL Editor**
2. Copia tutto il contenuto di `DATABASE_SCHEMA.sql`
3. Incolla nella console SQL
4. Clicca **Run**

### 3. Verificare le tabelle create
Nelle tabelle dovrai vedere:
- `tournaments` - Tornei
- `groups` - Gironi
- `registered_teams` - Squadre iscritte
- `matches` - Partite
- `athletes` - Atleti
- `athlete_team_associations` - Associazioni atleti-squadre
- `users` - Utenti (organizzatori)

---

## Schema delle Relazioni

```
USERS (Organizzatori)
  └─ creates ──→ TOURNAMENTS
                    ├─ has ──→ GROUPS
                    │            ├─ has ──→ REGISTERED_TEAMS
                    │            │            └─ associated_with ──→ ATHLETES
                    │            └─ has ──→ MATCHES
                    │                         ├─ team1 ──→ REGISTERED_TEAMS
                    │                         └─ team2 ──→ REGISTERED_TEAMS
                    └─ has ──→ MATCHES
```

---

## Struttura delle Tabelle

### TOURNAMENTS
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| name | TEXT | Nome torneo |
| date | TIMESTAMP | Data torneo |
| location | TEXT | Ubicazione |
| status | TEXT | In Preparazione / Attivo / Completato |
| category | TEXT | 2x2 Misto / 2x2 Maschile / 2x2 Femminile |
| structure | TEXT | Es. "4 gironi → Gold/Silver" |
| created_by | UUID | FK → auth.users |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### GROUPS
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| tournament_id | BIGINT | FK → tournaments |
| name | TEXT | Es. "Girone A" |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### REGISTERED_TEAMS
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| tournament_id | BIGINT | FK → tournaments |
| group_id | BIGINT | FK → groups |
| team_name | TEXT | Nome squadra |
| player1_name | TEXT | Cognome player 1 |
| player2_name | TEXT | Cognome player 2 |
| points | INTEGER | Punti della squadra |
| matches_played | INTEGER | Partite giocate |
| wins | INTEGER | Vittorie |
| losses | INTEGER | Sconfitte |
| sets_won | INTEGER | Set vinti |
| sets_lost | INTEGER | Set persi |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### MATCHES
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| tournament_id | BIGINT | FK → tournaments |
| group_id | BIGINT | FK → groups |
| team1_id | BIGINT | FK → registered_teams |
| team2_id | BIGINT | FK → registered_teams |
| team1_name | TEXT | Nome squadra 1 |
| team2_name | TEXT | Nome squadra 2 |
| team1_score | INTEGER | Score squadra 1 |
| team2_score | INTEGER | Score squadra 2 |
| status | TEXT | scheduled / in-progress / completed |
| winner_id | BIGINT | FK → registered_teams |
| match_date | TIMESTAMP | Data/ora partita |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### ATHLETES
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| surname | TEXT | Cognome atleta |
| name | TEXT | Nome atleta |
| email | TEXT | Email (unico) |
| phone | TEXT | Telefono |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### ATHLETE_TEAM_ASSOCIATIONS
| Campo | Tipo | Note |
|-------|------|------|
| id | BIGSERIAL | PK |
| athlete_id | BIGINT | FK → athletes |
| team_id | BIGINT | FK → registered_teams |
| tournament_id | BIGINT | FK → tournaments |
| joined_at | TIMESTAMP | Data iscrizione |

### USERS
| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK, FK → auth.users |
| username | TEXT | Username (unico) |
| email | TEXT | Email (unico) |
| role | TEXT | organizer / admin |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

## Configurazione Environment Variables

Aggiungi al tuo `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Installare Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Esempio di connessione (React)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Query Esempi

### Caricare tutti i tornei
```typescript
const { data, error } = await supabase
  .from('tournaments')
  .select('*')
  .order('date', { ascending: false })
```

### Caricare dettagli torneo con gironi e squadre
```typescript
const { data, error } = await supabase
  .from('tournaments')
  .select(`
    *,
    groups (
      *,
      registered_teams (*)
    ),
    matches (*)
  `)
  .eq('id', tournamentId)
  .single()
```

### Caricare squadre di un atleta
```typescript
const { data, error } = await supabase
  .from('athlete_team_associations')
  .select(`
    *,
    registered_teams (*),
    tournaments (*)
  `)
  .eq('athlete_id', athleteId)
```

### Aggiornare score di una partita
```typescript
const { error } = await supabase
  .from('matches')
  .update({
    team1_score: 21,
    team2_score: 19,
    status: 'completed',
    winner_id: team1_id,
    updated_at: new Date()
  })
  .eq('id', matchId)
```

---

## Features Incluse

✅ Row Level Security (RLS) per privacy
✅ Timestamps auto-updated (created_at, updated_at)
✅ Constraints di validazione
✅ Indici per performance
✅ Triggers per automazione
✅ Relazioni con ON DELETE CASCADE
✅ Unique constraints dove necessario

---

## Note Importanti

1. **Authentication**: Usa Supabase Auth per registrare/loggare gli organizzatori
2. **RLS**: Le policy di sicurezza sono già configurate
3. **Realtime**: Puoi abilitare Realtime per notifiche live (da SQL Editor → Replication)
4. **Backup**: Supabase fa backup automatici
5. **Rate limits**: Controlla i limiti della versione free
