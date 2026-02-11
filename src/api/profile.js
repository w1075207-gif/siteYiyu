const API_BASE = '';

export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/api/profile`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}
