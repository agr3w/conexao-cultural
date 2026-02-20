export const POST_TYPES = ['post', 'conversation', 'poll', 'event', 'gig', 'news'];
export const AUTHOR_KINDS = ['viewer', 'artist', 'place', 'community'];
export const AVATAR_FALLBACK_STYLES = ['sigil', 'neon', 'minimal'];
export const FIRESTORE_COLLECTIONS = {
  posts: 'posts',
  communities: 'communities',
};

/**
 * @typedef {Object} AuthorIdentity
 * @property {string} author
 * @property {string} handle
 * @property {'viewer'|'artist'|'place'|'community'} authorKind
 * @property {string | undefined} authorAvatarUrl
 * @property {'sigil'|'neon'|'minimal'} authorAvatarFallbackStyle
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {'post'|'conversation'|'poll'|'event'|'gig'|'news'} type
 * @property {boolean} allowComments
 * @property {string} author
 * @property {string} handle
 * @property {'viewer'|'artist'|'place'|'community'} authorKind
 * @property {string | undefined} authorAvatarUrl
 * @property {'sigil'|'neon'|'minimal'} authorAvatarFallbackStyle
 * @property {string} time
 * @property {string | undefined} title
 * @property {string} text
 * @property {number} likes
 * @property {number} comments
 * @property {boolean} image
 * @property {string | undefined} imageUrl
 * @property {string | undefined} audience
 * @property {string | undefined} communityId
 * @property {string | undefined} createdAt
 * @property {string | undefined} updatedAt
 */

export function isValidPostType(type) {
  return POST_TYPES.includes(String(type || '').trim());
}

export function normalizePostType(type, fallback = 'post') {
  const normalized = String(type || '').trim();
  return isValidPostType(normalized) ? normalized : fallback;
}

export function toFirestorePost(post) {
  const now = new Date().toISOString();
  return {
    ...post,
    type: normalizePostType(post?.type),
    createdAt: post?.createdAt || now,
    updatedAt: now,
  };
}

export function fromFirestorePost(docId, data = {}) {
  return {
    id: data.id || docId,
    ...data,
    type: normalizePostType(data.type),
  };
}
