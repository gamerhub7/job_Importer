require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const importsRoute = require('./routes/imports');
const cron = require('node-cron');
const { produceFromFeed } = require('./jobs/scheduleFetch');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/imports', importsRoute);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

async function start() {
  await db.connect(process.env.MONGO_URI);
  app.listen(PORT, () => console.log('Server listening on', PORT));

  // schedule hourly (top of hour)
  const feeds = (process.env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (feeds.length) {
    // run immediately once at startup
    feeds.forEach(url => produceFromFeed(url).catch(err => console.error('Initial produce error', err)));

    cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled feed fetch');
      for (const url of feeds) {
        try { await produceFromFeed(url); } catch (err) { console.error('Scheduled fetch error for', url, err); }
      }
    });
  }
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
