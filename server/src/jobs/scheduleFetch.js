// server/src/jobs/scheduleFetch.js
const { importQueue } = require('../queues/queues');
const { fetchFeed } = require('../services/fetchFeed');

function extractItemsFromFeed(json) {
  if (!json) return [];
  if (json.rss && json.rss.channel && json.rss.channel.item) return [].concat(json.rss.channel.item);
  if (json.feed && json.feed.entry) return [].concat(json.feed.entry);
  return [];
}

async function produceFromFeed(sourceUrl) {
  try {
    const json = await fetchFeed(sourceUrl);
    const items = extractItemsFromFeed(json);

    if (!items || items.length === 0) {
      console.warn(`No items found for feed ${sourceUrl} — skipping queue push.`);
      return { sourceUrl, pushed: 0, reason: 'no-items' };
    }

    await importQueue.add('import-batch', { sourceUrl, items }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    return { sourceUrl, pushed: items.length };
  } catch (err) {
    console.error('produceFromFeed error for', sourceUrl, err.message || err);
    if (err.excerpt) console.error('Excerpt:', err.excerpt.slice(0, 1000));
    if (err.badHtml) console.error('Returned HTML snippet:', err.badHtml.slice(0, 300));
    return { sourceUrl, pushed: 0, reason: 'fetch-failed', message: err.message };
  }
}

module.exports = { produceFromFeed };
