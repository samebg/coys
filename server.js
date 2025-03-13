import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));

// Sample match data
const matches = [
  {
    opponent: "Arsenal",
    competition: "Premier League",
    matchTime: new Date("2025-03-02T15:30:00Z"),
    isHome: true
  },
  {
    opponent: "Manchester United",
    competition: "FA Cup",
    matchTime: new Date("2025-03-16T20:00:00Z"),
    isHome: false
  },
  {
    opponent: "Liverpool",
    competition: "Premier League",
    matchTime: new Date("2025-03-30T16:00:00Z"),
    isHome: true
  }
];

const subscribers = [];

app.get('/', async (req, res) => {
  try {
    const template = await fs.readFile(join(__dirname, 'templates', 'index.html'), 'utf8');
    
    const now = new Date();
    const futureMatches = matches.filter(m => m.matchTime > now);
    const nextMatch = futureMatches.length > 0 ? 
      futureMatches.reduce((a, b) => a.matchTime < b.matchTime ? a : b) : 
      null;

    const matchesHtml = matches
      .sort((a, b) => a.matchTime - b.matchTime)
      .map(match => `
        <div class="border-b pb-4 last:border-b-0">
          <p class="text-lg font-semibold">vs ${match.opponent}</p>
          <p>${match.competition}</p>
          <p>${match.matchTime.toLocaleString()} (${match.isHome ? 'home' : 'away'})</p>
        </div>
      `).join('');

    const nextMatchHtml = nextMatch ? `
      <div class="space-y-2">
        <p class="text-xl">${nextMatch.opponent}</p>
        <p>Competition: ${nextMatch.competition}</p>
        <p>Date: ${nextMatch.matchTime.toLocaleString()}</p>
        <p>Location: ${nextMatch.isHome ? 'home' : 'away'}</p>
      </div>
    ` : '<p>No upcoming matches scheduled</p>';

    const content = template
      .replace('{{ next_match_content }}', nextMatchHtml)
      .replace('{{ matches_content }}', matchesHtml);

    res.send(content);
  } catch (error) {
    res.status(500).send('Error loading page');
  }
});

app.post('/subscribe', (req, res) => {
  const { email, phone } = req.body;
  
  if (!email && !phone) {
    res.status(400).send('Please provide either email or phone number');
    return;
  }

  subscribers.push({
    email,
    phone,
    subscribedAt: new Date().toISOString()
  });

  res.redirect('/');
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});