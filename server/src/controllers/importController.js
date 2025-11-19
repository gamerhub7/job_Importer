const ImportLog = require('../models/ImportLog');
const { produceFromFeed } = require('../jobs/scheduleFetch');

async function listImports(req, res) {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
  const skip = (page - 1) * limit;
  const q = {};
  if (req.query.sourceUrl) q.sourceUrl = req.query.sourceUrl;
  const total = await ImportLog.countDocuments(q);
  const items = await ImportLog.find(q).sort({ timestamp: -1 }).skip(skip).limit(limit).lean();
  res.json({ total, page, limit, items });
}

async function triggerImport(req, res) {
  const { sourceUrl } = req.body;
  if (!sourceUrl) return res.status(400).json({ error: 'sourceUrl required' });
  try {
    const r = await produceFromFeed(sourceUrl);
    res.json({ ok: true, pushed: r.pushed, sourceUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listImports, triggerImport };
