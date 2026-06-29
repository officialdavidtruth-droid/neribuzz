/**
 * Stores push subscriptions in memory.
 * For production: replace `subs` Map with Vercel KV storage.
 * See: https://vercel.com/docs/storage/vercel-kv
 */
const subs = new Map(); // endpoint → { keys, categories }

export default function handler(req, res) {
  if (req.method === "POST") {
    const { subscription, categories } = req.body || {};
    if (!subscription?.endpoint) return res.status(400).json({ error:"Missing subscription" });
    subs.set(subscription.endpoint, { ...subscription, categories: categories||[] });
    return res.json({ ok:true, total: subs.size });
  }
  if (req.method === "DELETE") {
    const { endpoint } = req.body || {};
    if (endpoint) subs.delete(endpoint);
    return res.json({ ok:true });
  }
  // GET — admin info only
  return res.json({ total: subs.size });
}
