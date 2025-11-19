// server/src/services/fetchFeed.js
const axios = require('axios');
const xml2js = require('xml2js');

async function fetchFeed(url) {
  const res = await axios.get(url, {
    timeout: 60000, // increased timeout to 60s
    headers: { 'User-Agent': 'job-importer-demo/1.0 (+https://example.com)' },
    responseType: 'text',
    maxContentLength: 10 * 1024 * 1024
  });

  let xml = res.data;
  // quick guard: if server returned HTML indicating blocking or captcha, bail
  if (typeof xml === 'string' && xml.trim().toLowerCase().startsWith('<!doctype html')) {
    const e = new Error(`Feed returned HTML (likely blocked) for ${url}`);
    e.badHtml = xml.slice(0, 1000);
    throw e;
  }

  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, strict: false });

  try {
    return await parser.parseStringPromise(xml);
  } catch (err) {
    console.warn('Initial xml2js parse failed for', url, '->', err.message);

    // try to find a feed fragment
    const startMatch = xml.match(/<\/?(rss|feed|channel)[\s>]/i);
    if (startMatch) {
      const idx = xml.indexOf(startMatch[0]);
      const fragment = xml.slice(idx);
      try {
        return await parser.parseStringPromise(fragment);
      } catch (err2) {
        console.warn('Fragment parse failed for', url, '->', err2.message);
      }
    }

    // attempt to escape stray ampersands
    const escaped = xml.replace(/&(?!(?:amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-fA-F]+;))/g, '&amp;');
    try {
      return await parser.parseStringPromise(escaped);
    } catch (err3) {
      const excerpt = xml.length > 2000 ? xml.slice(0, 2000) + '\n---truncated---' : xml;
      const e = new Error(`Failed to parse feed from ${url}: ${err3.message}`);
      e.excerpt = excerpt;
      throw e;
    }
  }
}

module.exports = { fetchFeed };
