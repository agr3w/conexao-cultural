import { AUTHOR_KINDS, AVATAR_FALLBACK_STYLES } from './domainTypes';

export function inferAuthorKindFromRaw({ author = '', handle = '', authorKind } = {}) {
  if (authorKind && AUTHOR_KINDS.includes(String(authorKind).trim())) {
    return String(authorKind).trim();
  }

  const normalizedAuthor = String(author || '').toLowerCase();
  const normalizedHandle = String(handle || '').toLowerCase();

  if (
    normalizedAuthor.includes('taverna') ||
    normalizedAuthor.includes('porão') ||
    normalizedAuthor.includes('porao') ||
    normalizedHandle.includes('pub') ||
    normalizedHandle.includes('bar')
  ) {
    return 'place';
  }

  if (
    normalizedAuthor.includes('lady') ||
    normalizedAuthor.includes('bardo') ||
    normalizedAuthor.includes('sussurros') ||
    normalizedHandle.includes('noir')
  ) {
    return 'artist';
  }

  return 'viewer';
}

export function inferFallbackStyleByAuthorKind(kind) {
  if (kind === 'artist') return 'neon';
  if (kind === 'place') return 'minimal';
  if (kind === 'community') return 'minimal';
  return 'sigil';
}

export function normalizeAuthorIdentity(
  authorData = {},
  { defaultAuthor = 'Viajante', defaultHandle = '@viajante', defaultKind = 'viewer' } = {}
) {
  const resolvedAuthor = String(authorData.author || defaultAuthor).trim();
  const resolvedHandle = String(authorData.handle || defaultHandle).trim();

  const resolvedKind = inferAuthorKindFromRaw({
    ...authorData,
    author: resolvedAuthor,
    handle: resolvedHandle,
    authorKind: authorData.authorKind || defaultKind,
  });

  const resolvedFallbackStyle = String(
    authorData.authorAvatarFallbackStyle || inferFallbackStyleByAuthorKind(resolvedKind)
  ).trim();

  const safeFallbackStyle = AVATAR_FALLBACK_STYLES.includes(resolvedFallbackStyle)
    ? resolvedFallbackStyle
    : inferFallbackStyleByAuthorKind(resolvedKind);

  return {
    author: resolvedAuthor,
    handle: resolvedHandle,
    authorKind: resolvedKind,
    authorAvatarUrl: String(authorData.authorAvatarUrl || '').trim() || undefined,
    authorAvatarFallbackStyle: safeFallbackStyle,
  };
}

export function applyAuthorIdentityToPost(post, defaults) {
  return {
    ...post,
    ...normalizeAuthorIdentity(post, defaults),
  };
}
