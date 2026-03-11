import { getArtistProfileById, validateArtistProfileOrThrow } from './artistProfiles';
import { getFeedCommunityPosts } from './feedPosts';
import { applyAuthorIdentityToPost } from './authorIdentity';

// Fonte mutável (precisa ser let)
let FAN_COMMUNITIES = [
  {
    id: 'fc_sussurros',
    artistProfileId: 'artist_sussurros',
    artistName: 'Sussurros da Noite',
    title: 'Círculo dos Sussurros',
    visibility: 'followers',
    description: 'Canal oficial com setlists, spoilers e datas antes do anúncio público.',
    createdAt: new Date().toISOString(),
  },
];

function normalizeNativeCommunityPost(post) {
  return applyAuthorIdentityToPost(post, {
    defaultAuthor: 'Equipe da Comunidade',
    defaultHandle: '@comunidade',
    defaultKind: 'community',
  });
}

const FAN_POSTS = [
  {
    id: 'fp1',
    communityId: 'fc_sussurros',
    type: 'news',
    title: 'Pré-venda liberada',
    author: 'Sussurros da Noite',
    authorKind: 'artist',
    authorAvatarUrl: '',
    authorAvatarFallbackStyle: 'neon',
    text: 'Membros do Círculo têm acesso 24h antes ao próximo ritual.',
    time: 'há 1h',
  },
].map(normalizeNativeCommunityPost);

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
    createdAt: new Date().toISOString(),
  };

  FAN_COMMUNITIES = [created, ...FAN_COMMUNITIES];
  return created;
}

export function getCommunityFeedById(communityId) {
  const nativePosts = FAN_POSTS
    .filter((p) => p.communityId === communityId)
    .map(normalizeNativeCommunityPost);
  const mirroredFeedPosts = getFeedCommunityPosts(communityId);
  return [...nativePosts, ...mirroredFeedPosts];
}

export function listFanCommunities() {
  return [...FAN_COMMUNITIES];
}