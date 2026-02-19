import { getArtistProfileById, validateArtistProfileOrThrow } from './artistProfiles';
import { getFeedCommunityPosts } from './feedPosts';

// Fonte mutável (precisa ser let)
let FAN_COMMUNITIES = [
  {
    id: 'fc_sussurros',
    artistProfileId: 'artist_sussurros',
    artistName: 'Sussurros da Noite',
    title: 'Círculo dos Sussurros',
    visibility: 'followers',
    description: 'Canal oficial com setlists, spoilers e datas antes do anúncio público.',
  },
];

const FAN_POSTS = [
  {
    id: 'fp1',
    communityId: 'fc_sussurros',
    type: 'news',
    title: 'Pré-venda liberada',
    text: 'Membros do Círculo têm acesso 24h antes ao próximo ritual.',
    time: 'há 1h',
  },
];

export function getCommunityById(communityId) {
  return FAN_COMMUNITIES.find((c) => c.id === communityId) ?? null;
}

export function getCommunityByArtistProfileId(artistProfileId) {
  return FAN_COMMUNITIES.find((c) => c.artistProfileId === artistProfileId) ?? null;
}

export function getOrCreateCommunityByArtistProfileId(artistProfileId) {
  const profile = getArtistProfileById(artistProfileId);
  validateArtistProfileOrThrow(profile);

  const existing = getCommunityByArtistProfileId(artistProfileId);
  if (existing) return existing;

  const created = {
    id: `fc_${artistProfileId}`,
    artistProfileId: profile.id,
    artistName: profile.name,
    title: profile.communityTitle || `Comunidade de ${profile.name}`,
    visibility: 'followers',
    description: `Canal oficial de ${profile.name}.`,
  };

  FAN_COMMUNITIES = [created, ...FAN_COMMUNITIES];
  return created;
}

export function getCommunityFeedById(communityId) {
  const nativePosts = FAN_POSTS.filter((p) => p.communityId === communityId);
  const mirroredFeedPosts = getFeedCommunityPosts(communityId);
  return [...nativePosts, ...mirroredFeedPosts];
}