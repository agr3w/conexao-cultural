import { getArtistProfileById, getDefaultArtistProfile, validateArtistProfileOrThrow } from './artistProfiles';
import { getOrCreateCommunityByArtistProfileId } from './fanCommunities';
import { applyAuthorIdentityToPost, normalizeAuthorIdentity } from './authorIdentity';
import { isValidPostType, normalizePostType } from './domainTypes';

function normalizeLegacyPostAvatar(post) {
  return applyAuthorIdentityToPost(post, {
    defaultAuthor: 'Viajante',
    defaultHandle: '@viajante',
    defaultKind: 'viewer',
  });
}

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
    description: 'A procura de uma taverna para tocar alaúde nesta sexta-feira 13. Algum Anfitrião disponível?',
    sanityLevel: 3,
    isPaid: true,
    priceLabel: 'Tributo colaborativo',
    imageUrl: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop',
    authorKind: 'artist',
    authorAvatarFallbackStyle: 'neon',
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
    authorKind: 'place',
    authorAvatarFallbackStyle: 'minimal',
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
    text: 'Qual estilo para o próximo encontro?',
    authorKind: 'artist',
    authorAvatarFallbackStyle: 'neon',
    pollOptions: [
      { id: 'p1', label: 'Jazz Noir', votes: 42 },
      { id: 'p2', label: 'Rock Clássico', votes: 30 },
      { id: 'p3', label: 'MPB', votes: 18 },
    ],
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
    authorKind: 'place',
    authorAvatarFallbackStyle: 'minimal',
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
    authorKind: 'artist',
    authorAvatarFallbackStyle: 'neon',
    likes: 88,
    comments: 17,
    image: false,
    communityId: 'fc_sussurros',
  },
].map(normalizeLegacyPostAvatar);

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
      authorKind: post.authorKind,
      authorAvatarUrl: post.authorAvatarUrl,
      authorAvatarFallbackStyle: post.authorAvatarFallbackStyle,
      audience: post.audience || 'public',
    }));
}

export function createPost({
  userProfile = 'viewer',
  artistProfileId,
  author,
  handle,
  authorAvatarUrl,
  authorAvatarFallbackStyle = 'sigil',
  type = 'post',
  title,
  text,
  audience = 'public',
  cache,
  eventDate,
  eventLocation,
  pollOptions = [],
  image = false,
  imageUrl,
  conversationPrompt,
  sanityLevel = 3,
  isPaid = false,
  priceLabel,
}) {
  if (!isValidPostType(type) || type === 'news') throw new Error('Tipo de post inválido.');

  const safeType = normalizePostType(type);

  const content = String(text ?? '').trim();
  const postTitle = String(title ?? '').trim();
  if (safeType !== 'poll' && safeType !== 'event' && content.length < 3) {
    throw new Error('Escreva uma mensagem com pelo menos 3 caracteres.');
  }

  let safeAuthorMeta = normalizeAuthorIdentity(
    {
      author,
      handle,
      authorKind: userProfile === 'artist' ? 'artist' : 'viewer',
      authorAvatarUrl,
      authorAvatarFallbackStyle,
    },
    {
      defaultAuthor: 'Viajante',
      defaultHandle: '@viajante',
      defaultKind: userProfile === 'artist' ? 'artist' : 'viewer',
    }
  );
  let safeAudience = 'public';
  let communityId;

  if (userProfile === 'artist') {
    const profile = getArtistProfileById(artistProfileId) ?? getDefaultArtistProfile();
    validateArtistProfileOrThrow(profile);
    safeAuthorMeta = normalizeAuthorIdentity(
      {
        author: profile.name,
        handle: profile.handle,
        authorKind: 'artist',
        authorAvatarUrl: profile.avatarUrl,
        authorAvatarFallbackStyle: profile.avatarFallbackStyle,
      },
      {
        defaultAuthor: profile.name,
        defaultHandle: profile.handle,
        defaultKind: 'artist',
      }
    );
    safeAudience = audience;
    const community = getOrCreateCommunityByArtistProfileId(profile.id);
    communityId = community.id;
  }

  if (safeType === 'gig' && userProfile !== 'artist') {
    throw new Error('Apenas artistas podem criar chamado.');
  }
  if (safeType === 'gig' && !String(cache || '').trim()) {
    throw new Error('Informe o cachê do chamado.');
  }

  let finalText = content;
  let normalizedPollOptions = [];

  if (safeType === 'poll') {
    const opts = Array.isArray(pollOptions) ? pollOptions.filter(Boolean) : [];
    if (opts.length < 2) throw new Error('Enquete precisa de pelo menos 2 opções.');
    normalizedPollOptions = opts.map((option, index) => ({
      id: `poll_${Date.now()}_${index}`,
      label: String(option),
      votes: 0,
    }));
    finalText = content || 'Escolha uma opção:';
  }

  if (safeType === 'event') {
    if (!postTitle) throw new Error('Evento precisa de título.');
    if (!String(eventDate || '').trim()) throw new Error('Evento precisa de data/hora.');
    if (!String(eventLocation || '').trim()) throw new Error('Evento precisa de local.');
    if (!String(content || '').trim()) throw new Error('Evento precisa de descrição.');
  }

  const id = String(Date.now());
  const post = {
    id,
    type: safeType,
    allowComments: safeType !== 'poll',
    author: safeAuthorMeta.author,
    handle: safeAuthorMeta.handle,
    time: 'agora',
    title: postTitle || undefined,
    text: finalText,
    likes: 0,
    comments: 0,
    authorKind: safeAuthorMeta.authorKind,
    authorAvatarUrl: safeAuthorMeta.authorAvatarUrl,
    authorAvatarFallbackStyle: safeAuthorMeta.authorAvatarFallbackStyle,
    image: Boolean(image || imageUrl),
    imageUrl: String(imageUrl || '').trim() || undefined,
    audience: safeAudience,
    communityId,
  };

  if (safeType === 'conversation') {
    post.conversationPrompt = String(conversationPrompt || postTitle || '').trim() || undefined;
  }

  if (safeType === 'poll') {
    post.pollOptions = normalizedPollOptions;
  }

  if (safeType === 'gig') post.cache = cache;
  if (safeType === 'event') {
    post.eventId = id;
    post.date = eventDate;
    post.location = eventLocation;
    post.description = content;
    post.sanityLevel = Number(sanityLevel) || 3;
    post.isPaid = Boolean(isPaid);
    post.priceLabel = String(priceLabel || '').trim() || undefined;
  }

  const normalizedPost = normalizeLegacyPostAvatar(post);
  FEED_POSTS.unshift(normalizedPost);
  return normalizedPost;
}

export function createBandPost({ artistProfileId, title, text, audience = 'public' }) {
  return createPost({ userProfile: 'artist', artistProfileId, type: 'post', title, text, audience });
}

export function createViewerPost({ author, handle, title, text }) {
  return createPost({ userProfile: 'viewer', author, handle, type: 'post', title, text, audience: 'public' });
}

export function getEventById(eventId) {
  const eventPost = FEED_POSTS.find((post) => post.type === 'event' && (post.eventId === eventId || post.id === eventId));
  if (!eventPost) return null;

  return {
    id: eventPost.eventId || eventPost.id,
    title: eventPost.title || 'Evento',
    location: eventPost.location || 'Local a definir',
    date: eventPost.date || 'Data a definir',
    description: eventPost.description || eventPost.text || 'Sem descrição.',
    sanityLevel: eventPost.sanityLevel || 3,
    isPaid: Boolean(eventPost.isPaid),
    priceLabel: eventPost.priceLabel,
    attendees: eventPost.attendees || [],
    image: eventPost.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop',
  };
}