/*
 Very small normalizer; extend per-feed as needed
*/
function normalize(item, sourceUrl) {
  // item may be an RSS `item` or Atom `entry` - be defensive
  const externalId = (item.guid && item.guid._) || item.guid || item.id || item.link || item.permalink || (item.title && item.title.substring(0, 60));
  const title = item.title || item['job:title'] || '';
  const description = item.description || item.summary || item.content || '';
  const company = item['job:company'] || (item['company'] && item['company']['name']) || '';
  const url = item.link || item.url || (item.enclosure && item.enclosure.url) || '';
  const categories = [];
  if (item.category) {
    if (Array.isArray(item.category)) categories.push(...item.category.map(c => (typeof c === 'string'?c:c._)));
    else categories.push(typeof item.category === 'string' ? item.category : item.category._);
  }

  return {
    externalId: String(externalId || (title + '::' + url)).slice(0, 200),
    title: title && String(title).trim(),
    company: company && String(company).trim(),
    description: String(description),
    url,
    categories,
    raw: item,
    sourceUrl
  };
}

module.exports = normalize;
