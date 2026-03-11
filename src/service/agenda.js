import {
  decrementEventConfirmedCount,
  getEventAvailability,
  getPostById,
  getVisibleFeedPosts,
  incrementEventConfirmedCount,
} from './feedPosts';

const AGENDA_COMMITMENTS = [];

function parseDateTimeInput(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  const nativeParsed = Date.parse(text);
  if (!Number.isNaN(nativeParsed)) return new Date(nativeParsed).toISOString();

  const brMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*[•-]?\s*(\d{1,2}):(\d{2}))?/);
  if (!brMatch) return null;

  const day = Number(brMatch[1]);
  const month = Number(brMatch[2]) - 1;
  const year = Number(brMatch[3]);
  const hour = Number(brMatch[4] || 20);
  const minute = Number(brMatch[5] || 0);

  const parsed = new Date(year, month, day, hour, minute, 0, 0);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function getDateLabelFromPost(post) {
  if (!post) return 'Data a definir';
  if (post.date) return post.date;
  return 'Data a definir';
}

function buildEventCommitmentFromPost(post, ownerUserId, role = 'viewer') {
  const parsedDate = parseDateTimeInput(post?.date);
  return {
    id: `agenda_event_${ownerUserId}_${post.id}`,
    ownerUserId,
    sourceType: 'event',
    sourcePostId: post.id,
    title: post.title || 'Evento',
    place: post.location || 'Local a definir',
    dateLabel: getDateLabelFromPost(post),
    startAt: parsedDate,
    status: role === 'artist' ? 'confirmado' : 'confirmado',
    role,
    cache: post.priceLabel || null,
    notes: post.text || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildGigCommitmentFromPost(post, ownerUserId) {
  return {
    id: `agenda_gig_${ownerUserId}_${post.id}`,
    ownerUserId,
    sourceType: 'gig',
    sourcePostId: post.id,
    title: `Chamado • ${post.author || 'Local'}`,
    place: post.author || 'Local não informado',
    dateLabel: post.date || 'Data em negociação',
    startAt: parseDateTimeInput(post?.date),
    status: 'aguardando',
    role: 'artist',
    cache: post.cache || null,
    notes: post.text || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function seedAgendaIfNeeded(ownerUserId, userProfile = 'viewer') {
  if (!ownerUserId) return;
  const alreadySeeded = AGENDA_COMMITMENTS.some((item) => item.ownerUserId === ownerUserId);
  if (alreadySeeded) return;

  const visiblePosts = getVisibleFeedPosts(userProfile, ownerUserId);
  const eventPosts = visiblePosts.filter((post) => post.type === 'event').slice(0, userProfile === 'artist' ? 2 : 1);
  const gigPosts = userProfile === 'artist'
    ? visiblePosts.filter((post) => post.type === 'gig').slice(0, 2)
    : [];

  eventPosts.forEach((post) => {
    AGENDA_COMMITMENTS.push(buildEventCommitmentFromPost(post, ownerUserId, userProfile === 'artist' ? 'artist' : 'viewer'));
  });

  gigPosts.forEach((post) => {
    AGENDA_COMMITMENTS.push(buildGigCommitmentFromPost(post, ownerUserId));
  });
}

function compareAgendaDate(a, b) {
  const aValue = Date.parse(a?.startAt || '') || Number.MAX_SAFE_INTEGER;
  const bValue = Date.parse(b?.startAt || '') || Number.MAX_SAFE_INTEGER;
  return aValue - bValue;
}

function isCommitmentDone(item) {
  return item.status === 'concluido' || item.status === 'cancelado';
}

function findCommitmentIndexBySource(ownerUserId, sourceType, sourcePostId) {
  return AGENDA_COMMITMENTS.findIndex(
    (item) => item.ownerUserId === ownerUserId && item.sourceType === sourceType && item.sourcePostId === sourcePostId
  );
}

export function getAgendaCommitments(ownerUserId, userProfile = 'viewer') {
  if (!ownerUserId) return [];
  seedAgendaIfNeeded(ownerUserId, userProfile);

  return AGENDA_COMMITMENTS
    .filter((item) => item.ownerUserId === ownerUserId)
    .sort(compareAgendaDate)
    .map((item) => ({ ...item }));
}

export function getAgendaSections(ownerUserId, userProfile = 'viewer') {
  const all = getAgendaCommitments(ownerUserId, userProfile);
  return {
    upcoming: all.filter((item) => !isCommitmentDone(item)),
    history: all.filter((item) => isCommitmentDone(item)),
  };
}

export function confirmEventInAgenda({ ownerUserId, eventId, userProfile = 'viewer' }) {
  if (!ownerUserId) throw new Error('Usuário inválido para confirmar evento.');
  if (!eventId) throw new Error('Evento inválido para confirmar.');

  const sourcePost = getPostById(eventId);
  if (!sourcePost || sourcePost.type !== 'event') {
    throw new Error('Evento não encontrado para confirmação.');
  }

  const existingIndex = findCommitmentIndexBySource(ownerUserId, 'event', sourcePost.id);
  const existingCommitment = existingIndex >= 0 ? AGENDA_COMMITMENTS[existingIndex] : null;
  const alreadyConfirmed = existingCommitment?.status === 'confirmado';
  const availability = getEventAvailability(sourcePost);

  if (alreadyConfirmed) {
    return AGENDA_COMMITMENTS[existingIndex];
  }

  if (availability?.status === 'full') {
    if (existingIndex >= 0) {
      AGENDA_COMMITMENTS[existingIndex] = {
        ...AGENDA_COMMITMENTS[existingIndex],
        status: 'lista_espera',
        updatedAt: new Date().toISOString(),
      };

      return AGENDA_COMMITMENTS[existingIndex];
    }

    const waitlisted = {
      ...buildEventCommitmentFromPost(sourcePost, ownerUserId, userProfile === 'artist' ? 'artist' : 'viewer'),
      status: 'lista_espera',
    };
    AGENDA_COMMITMENTS.push(waitlisted);
    return waitlisted;
  }

  if (existingIndex >= 0) {
    AGENDA_COMMITMENTS[existingIndex] = {
      ...AGENDA_COMMITMENTS[existingIndex],
      status: 'confirmado',
      updatedAt: new Date().toISOString(),
    };

    incrementEventConfirmedCount(sourcePost.id);

    return AGENDA_COMMITMENTS[existingIndex];
  }

  const created = buildEventCommitmentFromPost(sourcePost, ownerUserId, userProfile === 'artist' ? 'artist' : 'viewer');
  AGENDA_COMMITMENTS.push(created);
  incrementEventConfirmedCount(sourcePost.id);
  return created;
}

export function addRitualToAgenda({ ownerUserId, eventId, userProfile = 'viewer' }) {
  return confirmEventInAgenda({ ownerUserId, eventId, userProfile });
}

export function getAgendaCommitmentBySource({ ownerUserId, sourceType, sourcePostId }) {
  if (!ownerUserId || !sourceType || !sourcePostId) return null;

  const index = findCommitmentIndexBySource(ownerUserId, sourceType, sourcePostId);
  if (index < 0) return null;
  return { ...AGENDA_COMMITMENTS[index] };
}

export function isEventPresenceConfirmed(ownerUserId, eventId) {
  const commitment = getAgendaCommitmentBySource({
    ownerUserId,
    sourceType: 'event',
    sourcePostId: eventId,
  });

  return commitment?.status === 'confirmado';
}

export function cancelAgendaCommitment({ ownerUserId, commitmentId }) {
  if (!ownerUserId) throw new Error('Usuário inválido para cancelar compromisso.');
  if (!commitmentId) throw new Error('Compromisso inválido para cancelamento.');

  const index = AGENDA_COMMITMENTS.findIndex(
    (item) => item.ownerUserId === ownerUserId && item.id === commitmentId
  );
  if (index < 0) throw new Error('Compromisso não encontrado para cancelamento.');

  const previousStatus = AGENDA_COMMITMENTS[index].status;
  const sourceType = AGENDA_COMMITMENTS[index].sourceType;
  const sourcePostId = AGENDA_COMMITMENTS[index].sourcePostId;

  AGENDA_COMMITMENTS[index] = {
    ...AGENDA_COMMITMENTS[index],
    status: 'cancelado',
    updatedAt: new Date().toISOString(),
  };

  if (sourceType === 'event' && previousStatus === 'confirmado') {
    decrementEventConfirmedCount(sourcePostId);

    const waitlistedIndex = AGENDA_COMMITMENTS
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => (
        item.sourceType === 'event'
        && item.sourcePostId === sourcePostId
        && item.status === 'lista_espera'
      ))
      .sort((a, b) => Date.parse(a.item.createdAt || 0) - Date.parse(b.item.createdAt || 0))[0]?.idx;

    if (Number.isInteger(waitlistedIndex)) {
      AGENDA_COMMITMENTS[waitlistedIndex] = {
        ...AGENDA_COMMITMENTS[waitlistedIndex],
        status: 'confirmado',
        updatedAt: new Date().toISOString(),
      };
      incrementEventConfirmedCount(sourcePostId);
    }
  }

  return AGENDA_COMMITMENTS[index];
}

export function addGigCommitment({ ownerUserId, postId }) {
  if (!ownerUserId) throw new Error('Usuário inválido para missão.');
  if (!postId) throw new Error('Chamado inválido para missão.');

  const sourcePost = getPostById(postId);
  if (!sourcePost || sourcePost.type !== 'gig') {
    throw new Error('Chamado não encontrado para candidatura.');
  }

  const existing = AGENDA_COMMITMENTS.find(
    (item) => item.ownerUserId === ownerUserId && item.sourceType === 'gig' && item.sourcePostId === sourcePost.id
  );
  if (existing) return existing;

  const created = buildGigCommitmentFromPost(sourcePost, ownerUserId);
  AGENDA_COMMITMENTS.push(created);
  return created;
}

export function addGigToAgenda({ ownerUserId, postId }) {
  return addGigCommitment({ ownerUserId, postId });
}

export function markAgendaCommitmentDone(commitmentId, ownerUserId) {
  if (!commitmentId) throw new Error('Compromisso inválido.');
  if (!ownerUserId) throw new Error('Usuário inválido para atualizar compromisso.');

  const index = AGENDA_COMMITMENTS.findIndex(
    (item) => item.id === commitmentId && item.ownerUserId === ownerUserId
  );
  if (index < 0) throw new Error('Compromisso não encontrado.');

  AGENDA_COMMITMENTS[index] = {
    ...AGENDA_COMMITMENTS[index],
    status: 'concluido',
    updatedAt: new Date().toISOString(),
  };

  return AGENDA_COMMITMENTS[index];
}

export function getAgendaStats(ownerUserId, userProfile = 'viewer') {
  const { upcoming, history } = getAgendaSections(ownerUserId, userProfile);
  const confirmed = upcoming.filter((item) => item.status === 'confirmado').length;
  const pending = upcoming.filter((item) => item.status === 'aguardando' || item.status === 'lista_espera').length;

  return {
    total: upcoming.length + history.length,
    upcoming: upcoming.length,
    history: history.length,
    confirmed,
    pending,
  };
}
