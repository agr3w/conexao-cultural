import { getArtistProfileById, getDefaultArtistProfile, validateArtistProfileOrThrow } from './artistProfiles';
import { getOrCreateCommunityByArtistProfileId } from './fanCommunities';

export const FEED_POSTS = [
  {
    id: '1',
    type: 'event',
    allowComments: true,
    author: 'O Bardo Errante',
    handle: '@bardo_errante',
    time: '2h',
    title: 'Noite de Alaúde na Taverna',
    text: 'A procura de uma taverna para tocar alaúde nesta sexta-feira 13. Algum Anfitrião disponível?',
    likes: 12,
    comments: 4,
    image: true,
  },
  {
    id: '2',
    type: 'post',
    allowComments: true,
    author: 'Taverna do Dragão',
    handle: '@dragon_pub',
    time: '4h',
    text: 'Hoje tem hidromel em dobro para quem vier caracterizado! A noite promete ser lendária. 🍺🔥',
    likes: 45,
    comments: 10,
    image: false,
  },
  {
    id: '3',
    type: 'poll',
    allowComments: false,
    author: 'Lady Sombria',
    handle: '@lady_dark',
    time: '5h',
    text: 'Enquete: qual estilo para o próximo encontro? (Jazz Noir / Rock Clássico / MPB)',
    likes: 0,
    comments: 0,
    image: false,
  },
  {
    id: '4',
    type: 'gig',
    allowComments: true,
    author: 'Porão do Jazz',
    handle: '@porao_jazz',
    time: '1h',
    text: 'Chamado aberto para trio de Jazz Noir nesta sexta. Set de 90 minutos e passagem de som às 19h.',
    cache: 'R$ 1.200',
    likes: 19,
    comments: 6,
    image: false,
  },

  // Post publicado pela banda (aparece no Feed e no Fan Club)
  {
    id: '5',
    type: 'post',
    allowComments: true,
    author: 'Sussurros da Noite',
    handle: '@sussurros_noir',
    time: '35min',
    title: 'Spoiler do próximo ritual',
    text: 'Ensaiamos duas faixas inéditas hoje. Comunidade já recebeu trecho exclusivo.',
    likes: 88,
    comments: 17,
    image: false,
    communityId: 'fc_sussurros',
  },
];

const ARTIST_COMMUNITY_BY_HANDLE = {
  '@sussurros_noir': 'fc_sussurros',
};

const ARTIST_NAME_BY_HANDLE = {
  '@sussurros_noir': 'Sussurros da Noite',
};

export function getVisibleFeedPosts(userProfile = 'viewer') {
  return FEED_POSTS.filter((post) => {
    if (post.audience === 'community') return false; // VIP não aparece no feed geral
    if (post.type === 'gig' && userProfile !== 'artist') return false;
    return true;
  });
}

export function getFeedCommunityPosts(communityId) {
  return FEED_POSTS
    .filter((post) => post.communityId === communityId)
    .map((post) => ({
      id: `feed-${post.id}`,
      communityId,
      type: post.type || 'post',
      title: post.title || post.author,
      text: post.text,
      time: post.time,
      author: post.author,
      audience: post.audience || 'public',
    }));
}

export function createBandPost({ artistProfileId, title, text, audience = 'public' }) {
  const content = String(text ?? '').trim();
  const postTitle = String(title ?? '').trim();

  if (content.length < 3) {
    throw new Error('Escreva uma mensagem com pelo menos 3 caracteres.');
  }

  if (!['public', 'community'].includes(audience)) {
    throw new Error('Alcance inválido para publicação.');
  }

  const profile = getArtistProfileById(artistProfileId) ?? getDefaultArtistProfile();
  validateArtistProfileOrThrow(profile);

  const community = getOrCreateCommunityByArtistProfileId(profile.id);

  const post = {
    id: String(Date.now()),
    type: 'post',
    allowComments: true,
    author: profile.name,
    handle: profile.handle,
    time: 'agora',
    title: postTitle || undefined,
    text: content,
    likes: 0,
    comments: 0,
    image: false,
    audience, // public | community
    communityId: community.id,
    artistProfileId: profile.id,
  };

  FEED_POSTS.unshift(post);
  return post;
}