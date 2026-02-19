const ARTIST_PROFILES = [];

function normalizeHandle(raw, fallbackName = 'artista') {
  const base = String(raw || fallbackName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const withAt = base.startsWith('@') ? base : `@${base || 'artista'}`;
  return withAt;
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

export function listArtistProfilesByOwner(ownerUserId) {
  return ARTIST_PROFILES.filter((p) => p.ownerUserId === ownerUserId);
}

export function getArtistProfileById(id) {
  return ARTIST_PROFILES.find((p) => p.id === id) ?? null;
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
  techRider,
  links,
  communityTitle,
}) {
  const profileName = String(name || '').trim();
  if (profileName.length < 2) throw new Error('Nome artístico inválido.');

  const normalized = normalizeHandle(handle, profileName);
  const uniqueHandle = ensureUniqueHandle(normalized);

  const profile = {
    id: `artist_${Date.now()}`,
    ownerUserId,
    name: profileName,
    handle: uniqueHandle,
    vibe: String(vibe || 'Sem vibe definida').trim(),
    entity: String(entity || 'Lobo Solitário (CPF)').trim(),
    bio: String(bio || '').trim(),
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
    techRider: '2 vocais, 1 amp baixo, 2 retornos de palco.',
    links: {
      portfolio: 'https://spotify.com',
      gallery: 'https://instagram.com',
    },
    communityTitle: 'Sala de Testes do Lab',
  });
}

const LAB = ensureLabArtistProfile('u_artist_1');

const ARTISTS = [
  {
    id: 'artist_card_sussurros',
    profileId: 'artist_sussurros',
    type: 'artist',
    name: 'Sussurros da Noite',
    vibe: 'Melancolia',
    image: 'https://i.pravatar.cc/150?img=10',
  },
  {
    id: 'artist_card_lady',
    profileId: 'artist_lady',
    type: 'artist',
    name: 'Lady Veneno',
    vibe: 'Luxúria',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: `artist_card_${LAB?.id ?? 'lab'}`,
    profileId: LAB?.id ?? 'artist_lab',
    type: 'artist',
    name: LAB?.name ?? 'Laboratório Sonoro',
    vibe: (LAB?.vibe || 'Rock').split('/')[0].trim(),
    image: 'https://i.pravatar.cc/150?img=11',
  },
];

const RESULTS = [...ARTISTS, ...PLACES];