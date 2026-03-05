import { getArtistProfileById, getDefaultArtistProfile, validateArtistProfileOrThrow } from './artistProfiles';
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
    imageUrl: 'https://static.vecteezy.com/ti/vetor-gratis/p2/4341531-cafe-a-noite-apartamento-ilustracaoial-ilustracao-espacoso-urbano-bar-corredor-com-moveis-vintage-janelas-panoramicas-janelas-viradas-noite-horizonte-desenho-animado-cafeteria-interior-com-equipamento-profissional-vetor.jpg',
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

const USER_LIKED_POSTS = [];
const USER_HIDDEN_POSTS = [];
const USER_REPORTED_POSTS = [];

function ensureLikeArray(post) {
  if (!Array.isArray(post.likedByOwnerUserIds)) {
    post.likedByOwnerUserIds = [];
  }
  return post.likedByOwnerUserIds;
}

function normalizeHandleKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function buildSharedOriginPayload(post) {
  if (!post) return null;

  const source = post.type === 'share' && post.sharedPostOrigin
    ? post.sharedPostOrigin
    : post;

  return {
    id: source.id,
    type: source.type,
    title: source.title,
    text: source.text,
    author: source.author,
    handle: source.handle,
    time: source.time,
    image: Boolean(source.image || source.imageUrl),
    imageUrl: source.imageUrl,
    authorKind: source.authorKind,
    authorAvatarUrl: source.authorAvatarUrl,
    authorAvatarFallbackStyle: source.authorAvatarFallbackStyle,
  };
}

function normalizeCapacity(value) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getVisibleFeedPosts(userProfile = 'viewer', ownerUserId) {
  return FEED_POSTS.filter((post) => {
    if (post.audience === 'community') return false; // VIP não aparece no feed geral
    if (post.type === 'gig' && userProfile !== 'artist') return false;
    if (ownerUserId) {
      const hidden = USER_HIDDEN_POSTS.some((entry) => entry.ownerUserId === ownerUserId && entry.postId === post.id);
      if (hidden) return false;
    }
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
  ownerUserId,
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
  placeId,
  eventDate,
  eventLocation,
  pollOptions = [],
  image = false,
  imageUrl,
  conversationPrompt,
  sanityLevel = 3,
  isPaid = false,
  priceLabel,
  maxCapacity,
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
    communityId = `fc_${profile.id}`;
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
    if (!normalizeCapacity(maxCapacity)) throw new Error('Informe o limite máximo de pessoas no evento.');
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
    ownerUserId: ownerUserId || undefined,
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
    post.placeId = placeId ? String(placeId) : undefined;
    post.date = eventDate;
    post.location = eventLocation;
    post.description = content;
    post.sanityLevel = Number(sanityLevel) || 3;
    post.isPaid = Boolean(isPaid);
    post.priceLabel = post.isPaid ? (String(priceLabel || '').trim() || undefined) : undefined;
    post.maxCapacity = normalizeCapacity(maxCapacity);
    post.confirmedCount = 0;
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

export function sharePost({
  postId,
  ownerUserId,
  author,
  handle,
  authorKind = 'viewer',
  authorAvatarUrl,
  authorAvatarFallbackStyle = 'sigil',
  comment,
}) {
  if (!postId) throw new Error('Post inválido para compartilhamento.');
  if (!ownerUserId) throw new Error('Usuário inválido para compartilhamento.');

  const sourcePost = FEED_POSTS.find((item) => item.id === postId);
  if (!sourcePost) throw new Error('Post não encontrado para compartilhar.');

  const safeAuthorMeta = normalizeAuthorIdentity(
    {
      author,
      handle,
      authorKind,
      authorAvatarUrl,
      authorAvatarFallbackStyle,
    },
    {
      defaultAuthor: 'Viajante',
      defaultHandle: '@viajante',
      defaultKind: authorKind || 'viewer',
    }
  );

  const safeComment = String(comment || '').trim();
  const origin = buildSharedOriginPayload(sourcePost);
  if (!origin) throw new Error('Não foi possível recuperar o post de origem.');

  const nowIso = new Date().toISOString();
  const id = `share_${Date.now()}`;

  const sharedPost = normalizeLegacyPostAvatar({
    id,
    type: 'share',
    allowComments: true,
    author: safeAuthorMeta.author,
    handle: safeAuthorMeta.handle,
    time: 'agora',
    text: safeComment || `Compartilhou uma publicação de ${origin.author}.`,
    shareComment: safeComment || undefined,
    likes: 0,
    comments: 0,
    shares: 0,
    image: false,
    audience: 'public',
    ownerUserId,
    authorKind: safeAuthorMeta.authorKind,
    authorAvatarUrl: safeAuthorMeta.authorAvatarUrl,
    authorAvatarFallbackStyle: safeAuthorMeta.authorAvatarFallbackStyle,
    sharedPostId: origin.id,
    sharedAt: nowIso,
    sharedPostOrigin: origin,
  });

  sourcePost.shares = Number(sourcePost.shares || 0) + 1;
  FEED_POSTS.unshift(sharedPost);
  return sharedPost;
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
    maxCapacity: eventPost.maxCapacity,
    confirmedCount: eventPost.confirmedCount,
    attendees: eventPost.attendees || [],
    image: eventPost.imageUrl || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop',
  };
}

export function getEventAvailability(postOrId) {
  const post = typeof postOrId === 'string' ? getPostById(postOrId) : postOrId;
  if (!post || post.type !== 'event') return null;

  const maxCapacity = normalizeCapacity(post.maxCapacity);
  if (!maxCapacity) return null;

  const confirmedCount = Math.min(
    Math.max(0, Number(post.confirmedCount || 0)),
    maxCapacity
  );
  const remaining = Math.max(0, maxCapacity - confirmedCount);
  const criticalThreshold = Math.max(3, Math.ceil(maxCapacity * 0.15));

  if (remaining <= 0) {
    return {
      status: 'full',
      label: 'Lotado',
      remaining,
      maxCapacity,
      confirmedCount,
    };
  }

  if (remaining <= criticalThreshold) {
    return {
      status: 'last',
      label: 'Últimas vagas',
      remaining,
      maxCapacity,
      confirmedCount,
    };
  }

  return {
    status: 'available',
    label: `${remaining} vagas`,
    remaining,
    maxCapacity,
    confirmedCount,
  };
}

export function incrementEventConfirmedCount(eventId) {
  const post = getPostById(eventId);
  if (!post || post.type !== 'event') return null;

  const maxCapacity = normalizeCapacity(post.maxCapacity);
  const current = Math.max(0, Number(post.confirmedCount || 0));

  if (!maxCapacity) {
    post.confirmedCount = current + 1;
    return post.confirmedCount;
  }

  post.confirmedCount = Math.min(maxCapacity, current + 1);
  return post.confirmedCount;
}

export function decrementEventConfirmedCount(eventId) {
  const post = getPostById(eventId);
  if (!post || post.type !== 'event') return null;

  const current = Math.max(0, Number(post.confirmedCount || 0));
  post.confirmedCount = Math.max(0, current - 1);
  return post.confirmedCount;
}

export function getPostById(postId) {
  if (!postId) return null;
  return FEED_POSTS.find((post) => post.id === postId) || null;
}

export function isPostOwnedBy(postId, ownerUserId) {
  if (!postId || !ownerUserId) return false;
  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) return false;
  return post.ownerUserId === ownerUserId;
}

export function updatePostContent({ postId, ownerUserId, title, text }) {
  if (!postId) throw new Error('Post inválido para edição.');
  if (!ownerUserId) throw new Error('Usuário inválido para edição.');

  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) throw new Error('Post não encontrado.');
  if (post.ownerUserId !== ownerUserId) throw new Error('Você só pode editar posts seus.');

  const safeTitle = String(title || '').trim();
  const safeText = String(text || '').trim();

  if (safeText.length < 3) throw new Error('Escreva pelo menos 3 caracteres no conteúdo.');

  post.title = safeTitle || undefined;
  post.text = safeText;
  post.editedAt = new Date().toISOString();
  post.time = 'agora';

  return post;
}

export function hidePostForOwner(postId, ownerUserId) {
  if (!postId) throw new Error('Post inválido para ocultar.');
  if (!ownerUserId) throw new Error('Usuário inválido para ocultar.');

  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) throw new Error('Post não encontrado.');

  const exists = USER_HIDDEN_POSTS.some((entry) => entry.ownerUserId === ownerUserId && entry.postId === postId);
  if (!exists) {
    USER_HIDDEN_POSTS.push({
      ownerUserId,
      postId,
      hiddenAt: new Date().toISOString(),
    });
  }

  return true;
}

export function getHiddenPostsByOwner(ownerUserId) {
  if (!ownerUserId) return [];

  return USER_HIDDEN_POSTS
    .filter((entry) => entry.ownerUserId === ownerUserId)
    .map((entry) => {
      const post = FEED_POSTS.find((item) => item.id === entry.postId);
      if (!post) return null;

      return {
        ...post,
        hiddenAt: entry.hiddenAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.hiddenAt || 0) - Date.parse(a.hiddenAt || 0));
}

export function restoreHiddenPostForOwner(postId, ownerUserId) {
  if (!postId) throw new Error('Post inválido para reexibir.');
  if (!ownerUserId) throw new Error('Usuário inválido para reexibir.');

  const index = USER_HIDDEN_POSTS.findIndex(
    (entry) => entry.ownerUserId === ownerUserId && entry.postId === postId
  );

  if (index < 0) return false;

  USER_HIDDEN_POSTS.splice(index, 1);
  return true;
}

export function reportPost(postId, ownerUserId, reason = 'inapropriado') {
  if (!postId) throw new Error('Post inválido para denúncia.');
  if (!ownerUserId) throw new Error('Usuário inválido para denúncia.');

  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) throw new Error('Post não encontrado.');

  USER_REPORTED_POSTS.unshift({
    id: `report_${Date.now()}`,
    ownerUserId,
    postId,
    reason: String(reason || 'inapropriado').trim() || 'inapropriado',
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function getPostPublicLink(postId) {
  if (!postId) return 'https://conexao-cultural.app/post';
  return `https://conexao-cultural.app/post/${encodeURIComponent(postId)}`;
}

export function isPostLikedByOwner(postId, ownerUserId) {
  if (!ownerUserId || !postId) return false;
  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) return false;

  const likedBy = ensureLikeArray(post);
  return likedBy.includes(ownerUserId);
}

export function togglePostLike(postId, ownerUserId) {
  if (!postId) throw new Error('Post inválido para curtida.');
  if (!ownerUserId) throw new Error('Usuário inválido para curtida.');

  const post = FEED_POSTS.find((item) => item.id === postId);
  if (!post) throw new Error('Post não encontrado.');

  const likedBy = ensureLikeArray(post);
  const alreadyLiked = likedBy.includes(ownerUserId);

  if (alreadyLiked) {
    post.likedByOwnerUserIds = likedBy.filter((id) => id !== ownerUserId);
    post.likes = Math.max(0, Number(post.likes || 0) - 1);

    const historyIndex = USER_LIKED_POSTS.findIndex(
      (entry) => entry.ownerUserId === ownerUserId && entry.postId === postId
    );
    if (historyIndex >= 0) USER_LIKED_POSTS.splice(historyIndex, 1);

    return { post, liked: false, likes: post.likes };
  }

  post.likedByOwnerUserIds = [...likedBy, ownerUserId];
  post.likes = Number(post.likes || 0) + 1;

  const existing = USER_LIKED_POSTS.find(
    (entry) => entry.ownerUserId === ownerUserId && entry.postId === postId
  );

  if (existing) {
    existing.likedAt = new Date().toISOString();
  } else {
    USER_LIKED_POSTS.unshift({
      ownerUserId,
      postId,
      likedAt: new Date().toISOString(),
    });
  }

  return { post, liked: true, likes: post.likes };
}

export function getLikedPostsByOwner(ownerUserId) {
  if (!ownerUserId) return [];

  return USER_LIKED_POSTS
    .filter((entry) => entry.ownerUserId === ownerUserId)
    .map((entry) => {
      const post = FEED_POSTS.find((item) => item.id === entry.postId);
      if (!post) return null;

      return {
        ...post,
        likedAt: entry.likedAt,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.likedAt || 0) - Date.parse(a.likedAt || 0));
}

export function getPostsByAuthorHandle(handle, options = {}) {
  const normalizedHandle = normalizeHandleKey(handle);
  if (!normalizedHandle) return [];

  const includeCommunity = options?.includeCommunity !== false;
  const limit = Number(options?.limit || 0);

  const filtered = FEED_POSTS.filter((post) => {
    if (normalizeHandleKey(post?.handle) !== normalizedHandle) return false;
    if (!includeCommunity && post?.audience === 'community') return false;
    return true;
  });

  if (limit > 0) return filtered.slice(0, limit);
  return filtered;
}