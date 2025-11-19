function hasChanged(existing, normalized) {
  if (!existing) return true;
  if (existing.title !== normalized.title) return true;
  if ((existing.description || '') !== (normalized.description || '')) return true;
  if ((existing.url || '') !== (normalized.url || '')) return true;
  // could compute a content hash for robust comparison
  return false;
}

module.exports = hasChanged;
