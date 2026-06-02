// Thin client for the protected /api/entries function. Cookies (the Identity
// session) are sent automatically for same-origin requests.

const ENDPOINT = '/api/entries';

/**
 * Fetch every entry for the signed-in user, grouped as { daily, weekly }.
 */
export async function fetchAllEntries() {
  const res = await fetch(ENDPOINT, { method: 'GET' });
  if (!res.ok) throw new Error(`Failed to load entries (${res.status})`);
  return res.json();
}

/**
 * Upsert a single entry on the server.
 */
export async function putEntry(type, key, data) {
  const res = await fetch(ENDPOINT, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type, key, data }),
  });
  if (!res.ok) throw new Error(`Failed to save entry (${res.status})`);
  return res.json();
}
