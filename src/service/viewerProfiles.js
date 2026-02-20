const VIEWER_PROFILES = [];

function normalizeHandle(raw, fallbackName = 'viajante') {
  const base = String(raw || fallbackName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base.startsWith('@') ? base : `@${base || 'viajante'}`;
}

function ensureUniqueHandle(handle) {
  let candidate = handle;
  let i = 1;
  while (VIEWER_PROFILES.some((p) => p.handle === candidate)) {
    candidate = `${handle}_${i}`;
    i += 1;
  }
  return candidate;
}

export function createViewerProfile({
  ownerUserId = 'u_viewer_1',
  name,
  handle,
  email,
  city,
  bio,
  intention,
  avatarUrl,
  avatarFallbackStyle = 'sigil',
  interests = [],
}) {
  const profileName = String(name || '').trim();
  if (profileName.length < 2) throw new Error('Nome inválido.');

  const normalized = normalizeHandle(handle, profileName);
  const uniqueHandle = ensureUniqueHandle(normalized);

  const profile = {
    id: `viewer_${Date.now()}`,
    ownerUserId,
    name: profileName,
    handle: uniqueHandle,
    email: String(email || '').trim(),
    city: String(city || '').trim(),
    bio: String(bio || '').trim(),
    intention: String(intention || '').trim(),
    avatarUrl: String(avatarUrl || '').trim(),
    avatarFallbackStyle: String(avatarFallbackStyle || 'sigil').trim(),
    interests,
    createdAt: new Date().toISOString(),
  };

  VIEWER_PROFILES.unshift(profile);
  return profile;
}

export function getViewerProfileById(id) {
  return VIEWER_PROFILES.find((p) => p.id === id) ?? null;
}

export function updateViewerProfile(id, updates = {}) {
  const index = VIEWER_PROFILES.findIndex((p) => p.id === id);
  if (index < 0) throw new Error('Perfil de usuário não encontrado.');

  const current = VIEWER_PROFILES[index];

  const nextName = updates.name !== undefined ? String(updates.name).trim() : current.name;
  if (!nextName || nextName.length < 2) {
    throw new Error('Nome inválido para o perfil.');
  }

  const next = {
    ...current,
    ...updates,
    name: nextName,
    city: updates.city !== undefined ? String(updates.city || '').trim() : current.city,
    bio: updates.bio !== undefined ? String(updates.bio || '').trim() : current.bio,
    intention: updates.intention !== undefined ? String(updates.intention || '').trim() : current.intention,
    email: updates.email !== undefined ? String(updates.email || '').trim() : current.email,
    avatarUrl: updates.avatarUrl !== undefined ? String(updates.avatarUrl || '').trim() : current.avatarUrl,
    avatarFallbackStyle: updates.avatarFallbackStyle !== undefined
      ? String(updates.avatarFallbackStyle || 'sigil').trim()
      : current.avatarFallbackStyle,
    updatedAt: new Date().toISOString(),
  };

  VIEWER_PROFILES[index] = next;
  return next;
}

export function getDefaultViewerProfile(ownerUserId = 'u_viewer_1') {
  return VIEWER_PROFILES.find((p) => p.ownerUserId === ownerUserId) ?? null;
}

export function ensureLabViewerProfile(ownerUserId = 'u_viewer_1') {
  const existing = getDefaultViewerProfile(ownerUserId);
  if (existing) return existing;

  return createViewerProfile({
    ownerUserId,
    name: 'Viajante do Caos',
    handle: '@viajante_01',
    email: 'viajante@caos.app',
    city: 'Curitiba - PR',
    bio: 'Explorador de experiências culturais.',
    intention: 'solo',
    avatarUrl: '',
    avatarFallbackStyle: 'sigil',
    interests: ['Rock', 'Jazz Noir'],
  });
}