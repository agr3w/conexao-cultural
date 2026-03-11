import { PLACES } from './places';
import { listAllArtistProfiles } from './artistProfiles';
import { listFanCommunities } from './fanCommunities';

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function scoreItem(item, query) {
  if (!query) return 1;
  const q = normalize(query);
  const haystack = normalize(
    [
      item.name,
      item.handle,
      item.title,
      item.description,
      item.address,
      item.artistName,
      item.vibe,
      item.entity,
      item.techRider,
      item.tags,
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (!haystack.includes(q)) return 0;
  if (normalize(item.name || item.title || '').startsWith(q)) return 3;
  return 2;
}

function getRecencyScore(createdAt) {
  if (!createdAt) return 0;
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) return 0;

  const days = Math.max(0, (Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  return 1 / (1 + days / 14);
}

export function getOracleResults({ searchText = '', selectedVibe = null, selectedType = null }) {
  const artists = listAllArtistProfiles().map((p) => ({
    id: `artist:${p.id}`,
    type: 'artist',
    profileId: p.id,
    name: p.name,
    handle: p.handle,
    entity: p.entity || '',
    description: p.bio || '',
    techRider: p.techRider || '',
    communityTitle: p.communityTitle || '',
    vibe: p.vibe || '',
    image: p.avatarUrl || '',
    avatarFallbackStyle: p.avatarFallbackStyle || 'sigil',
    tags: [p.vibe, p.entity, p.communityTitle].filter(Boolean).join(' • '),
    createdAt: p.createdAt || null,
  }));

  const places = PLACES.map((p) => ({
    id: `place:${p.id}`,
    type: 'place',
    placeId: p.id,
    name: p.name,
    vibe: p.vibe || '',
    image: p.image,
    address: p.address,
    category: p.category,
    heat: p.heat,
    description: p.description,
    tags: [p.vibe, p.category, p.heat].filter(Boolean).join(' • '),
    createdAt: null,
    ...p,
  }));

  const communities = listFanCommunities().map((c) => ({
    id: `community:${c.id}`,
    type: 'community',
    communityId: c.id,
    name: c.title,
    artistName: c.artistName,
    description: c.description,
    title: c.title,
    visibility: c.visibility,
    vibe: '',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400',
    avatarFallbackStyle: 'neon',
    tags: [c.artistName, c.visibility === 'followers' ? 'VIP/Fãs' : c.visibility].filter(Boolean).join(' • '),
    createdAt: c.createdAt || null,
  }));

  return [...artists, ...places, ...communities]
    .filter((item) => {
      if (selectedType && item.type !== selectedType) return false;
      if (selectedVibe && item.vibe && item.vibe !== selectedVibe) return false; // compatibilidade
      return scoreItem(item, searchText) > 0;
    })
    .map((item) => {
      const relevanceScore = scoreItem(item, searchText);
      const recencyScore = getRecencyScore(item.createdAt);
      const rankScore = relevanceScore + recencyScore;

      return {
        ...item,
        relevanceScore,
        recencyScore,
        rankScore,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}