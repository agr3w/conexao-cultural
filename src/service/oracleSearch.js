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
    [item.name, item.handle, item.title, item.description, item.address, item.artistName, item.vibe]
      .filter(Boolean)
      .join(' ')
  );

  if (!haystack.includes(q)) return 0;
  if (normalize(item.name || item.title || '').startsWith(q)) return 3;
  return 2;
}

export function getOracleResults({ searchText = '', selectedVibe = null, selectedType = null }) {
  const artists = listAllArtistProfiles().map((p) => ({
    id: `artist:${p.id}`,
    type: 'artist',
    profileId: p.id,
    name: p.name,
    handle: p.handle,
    vibe: p.vibe || '',
    image: 'https://i.pravatar.cc/150?img=11',
  }));

  const places = PLACES.map((p) => ({
    id: `place:${p.id}`,
    type: 'place',
    placeId: p.id,
    name: p.name,
    vibe: p.vibe || '',
    image: p.image,
    address: p.address,
    description: p.description,
    ...p,
  }));

  const communities = listFanCommunities().map((c) => ({
    id: `community:${c.id}`,
    type: 'community',
    communityId: c.id,
    name: c.title,
    artistName: c.artistName,
    description: c.description,
    vibe: '',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400',
  }));

  return [...artists, ...places, ...communities]
    .filter((item) => {
      if (selectedType && item.type !== selectedType) return false;
      if (selectedVibe && item.vibe && item.vibe !== selectedVibe) return false; // compatibilidade
      return scoreItem(item, searchText) > 0;
    })
    .sort((a, b) => scoreItem(b, searchText) - scoreItem(a, searchText));
}