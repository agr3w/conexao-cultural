const ARTIST_PROFILES = [
  {
    id: 'artist_sussurros',
    ownerUserId: 'u_artist_seed_1',
    name: 'Sussurros da Noite',
    handle: '@sussurros_noite',
    vibe: 'Darkwave Ritual',
    entity: 'A Guilda (Banda/CNPJ)',
    bio: 'Trio autoral com synth sombrio, poesia urbana e rituais visuais em palco.',
    avatarUrl: '',
    avatarFallbackStyle: 'neon',
    techRider: '2 retornos, DI para synth, 3 canais de voz, luz baixa com contraluz roxa.',
    links: {
      portfolio: 'https://spotify.com',
      gallery: 'https://instagram.com',
    },
    communityTitle: 'Círculo dos Sussurros',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'artist_rua13',
    ownerUserId: 'u_artist_seed_2',
    name: 'Rua 13 Coletivo',
    handle: '@rua13coletivo',
    vibe: 'Rap Experimental',
    entity: 'Coletivo Independente',
    bio: 'Rimas, beats orgânicos e intervenção visual com participação do público.',
    avatarUrl: '',
    avatarFallbackStyle: 'sigil',
    techRider: '2 mics sem fio, 1 DJ set, 2 monitores, projeção HDMI.',
    links: {
      portfolio: 'https://soundcloud.com',
      gallery: 'https://instagram.com',
    },
    communityTitle: 'Tribo Rua 13',
    createdAt: new Date().toISOString(),
  },
];

function normalizeHandle(raw, fallbackName = 'artista') {
  const base = String(raw || fallbackName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base.startsWith('@') ? base : `@${base || 'artista'}`;
}

function isValidHandle(handle) {
  return typeof handle === 'string' && /^@[a-z0-9_]{3,}$/.test(handle);
}

function ensureUniqueHandle(handle) {
  let candidate = handle;
  let i = 1;
  while (ARTIST_PROFILES.some((p) => p.handle === candidate)) {
    candidate = `${handle}_${i}`;
    i += 1;
  }
  return candidate;
}

function ensureUniqueHandleExcept(handle, profileId) {
  let candidate = handle;
  let i = 1;
  while (ARTIST_PROFILES.some((p) => p.id !== profileId && p.handle === candidate)) {
    candidate = `${handle}_${i}`;
    i += 1;
  }
  return candidate;
}

export function listArtistProfilesByOwner(ownerUserId) {
  return ARTIST_PROFILES.filter((p) => p.ownerUserId === ownerUserId);
}

export function listAllArtistProfiles() {
  return [...ARTIST_PROFILES];
}

export function getArtistProfileById(id) {
  return ARTIST_PROFILES.find((p) => p.id === id) ?? null;
}

export function updateArtistProfile(id, updates = {}) {
  const index = ARTIST_PROFILES.findIndex((p) => p.id === id);
  if (index < 0) throw new Error('Perfil artístico não encontrado.');

  const current = ARTIST_PROFILES[index];

  const nextName = updates.name !== undefined ? String(updates.name).trim() : current.name;
  if (!nextName || nextName.length < 2) {
    throw new Error('Nome artístico inválido.');
  }

  const nextHandleRaw = updates.handle !== undefined ? String(updates.handle || '').trim() : current.handle;
  const normalizedHandle = normalizeHandle(nextHandleRaw, nextName);
  const uniqueHandle = ensureUniqueHandleExcept(normalizedHandle, id);

  const next = {
    ...current,
    ...updates,
    name: nextName,
    handle: uniqueHandle,
    vibe: updates.vibe !== undefined ? String(updates.vibe || '').trim() : current.vibe,
    entity: updates.entity !== undefined ? String(updates.entity || '').trim() : current.entity,
    bio: updates.bio !== undefined ? String(updates.bio || '').trim() : current.bio,
    avatarUrl: updates.avatarUrl !== undefined ? String(updates.avatarUrl || '').trim() : current.avatarUrl,
    avatarFallbackStyle: updates.avatarFallbackStyle !== undefined
      ? String(updates.avatarFallbackStyle || 'sigil').trim()
      : current.avatarFallbackStyle,
    techRider: updates.techRider !== undefined ? String(updates.techRider || '').trim() : current.techRider,
    communityTitle: updates.communityTitle !== undefined
      ? String(updates.communityTitle || '').trim()
      : current.communityTitle,
    links: {
      ...(current.links || {}),
      ...(updates.links || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  validateArtistProfileOrThrow(next);
  ARTIST_PROFILES[index] = next;
  return next;
}

export function getDefaultArtistProfile(ownerUserId = 'u_artist_1') {
  return listArtistProfilesByOwner(ownerUserId)[0] ?? null;
}

export function validateArtistProfileOrThrow(profile) {
  if (!profile) throw new Error('Perfil artístico não encontrado.');
  if (!profile.name?.trim()) throw new Error('Perfil artístico sem nome.');
  if (!isValidHandle(profile.handle)) throw new Error('Handle inválido no perfil artístico.');
  return true;
}

export function createArtistProfile({
  ownerUserId = 'u_artist_1',
  name,
  handle,
  vibe,
  entity,
  bio,
  avatarUrl,
  avatarFallbackStyle = 'sigil',
  techRider,
  links,
  communityTitle,
}) {
  const profileName = String(name || '').trim();
  if (profileName.length < 2) throw new Error('Nome artístico inválido.');

  const normalizedHandle = normalizeHandle(handle, profileName);
  const uniqueHandle = ensureUniqueHandle(normalizedHandle);

  const profile = {
    id: `artist_${Date.now()}`,
    ownerUserId,
    name: profileName,
    handle: uniqueHandle,
    vibe: String(vibe || 'Sem vibe definida').trim(),
    entity: String(entity || 'Lobo Solitário (CPF)').trim(),
    bio: String(bio || '').trim(),
    avatarUrl: String(avatarUrl || '').trim(),
    avatarFallbackStyle: String(avatarFallbackStyle || 'sigil').trim(),
    techRider: String(techRider || '').trim(),
    links: links || {},
    communityTitle: String(communityTitle || `Clã de ${profileName}`).trim(),
    createdAt: new Date().toISOString(),
  };

  validateArtistProfileOrThrow(profile);
  ARTIST_PROFILES.unshift(profile);
  return profile;
}

export function ensureLabArtistProfile(ownerUserId = 'u_artist_1') {
  const existing = ARTIST_PROFILES.find((p) => p.ownerUserId === ownerUserId);
  if (existing) return existing;

  return createArtistProfile({
    ownerUserId,
    name: 'Laboratório Sonoro',
    handle: '@lab_sonoro',
    vibe: 'Rock Alternativo',
    entity: 'A Guilda (Banda/CNPJ)',
    bio: 'Perfil de teste para validar fluxo de comunidade e publicações.',
    avatarUrl: '',
    avatarFallbackStyle: 'sigil',
    techRider: '2 vocais, 1 amp baixo, 2 retornos de palco.',
    links: {
      portfolio: 'https://spotify.com',
      gallery: 'https://instagram.com',
    },
    communityTitle: 'Sala de Testes do Lab',
  });
}