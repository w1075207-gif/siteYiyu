const API_BASE = '';

export async function fetchSchedule() {
  const res = await fetch(`${API_BASE}/api/schedule`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function createSchedule(item) {
  const res = await fetch(`${API_BASE}/api/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create');
  }
  return res.json();
}

export async function updateSchedule(id, item) {
  const res = await fetch(`${API_BASE}/api/schedule/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update');
  }
  return res.json();
}

export async function deleteSchedule(id) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/schedule/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    throw new Error('网络错误，请刷新页面查看是否已删除');
  }
  if (res.status >= 200 && res.status < 300) return;
  // 404 can mean "already deleted" (e.g. proxy/race); treat as success so UI doesn't show "failed"
  if (res.status === 404) return;
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || '删除失败');
}
