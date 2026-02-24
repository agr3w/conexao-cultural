import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from './Button';
import ProfileAvatar from './ProfileAvatar';
import { getEventAvailability } from '../service/feedPosts';

const TYPE_LABELS = {
  event: 'EVENTO',
  post: 'POST',
  conversation: 'CONVERSA',
  poll: 'ENQUETE',
  gig: 'CHAMADO',
  share: 'COMPARTILHAMENTO',
};

function formatCompactCount(value) {
  const n = Number(value || 0);
  if (n < 1000) return String(n);
  if (n < 1000000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')}K`;
  return `${(n / 1000000).toFixed(1).replace('.', ',')}M`;
}

function extractPollOptions(text = '') {
  const labels = String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\)\s+/.test(line))
    .map((line) => line.replace(/^\d+\)\s+/, ''));

  return labels.map((label, index) => ({
    id: `legacy_${index}_${label}`,
    label,
    votes: 0,
  }));
}

function PressScale({ children, onPress, style, activeOpacity = 0.95, disabled = false }) {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;

    Animated.spring(pressAnim, {
      toValue: 0.96,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 7,
      tension: 110,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PostCard({
  data,
  userProfile,
  likedByCurrentUser = false,
  onToggleLike,
  onShare,
  onOpenSharedOrigin,
  onMorePress,
  onApplyGig,
  onConfirmEvent,
  eventPresenceConfirmed = false,
  eventWaitlisted = false,
}) {
  const isGig = data.type === 'gig';
  const isPoll = data.type === 'poll';
  const isEvent = data.type === 'event';
  const isConversation = data.type === 'conversation';
  const isShare = data.type === 'share';
  const eventAvailability = isEvent ? getEventAvailability(data) : null;
  const isEventFullForNewConfirm = isEvent && eventAvailability?.status === 'full' && !eventPresenceConfirmed && !eventWaitlisted;
  const sharedOrigin = isShare ? data.sharedPostOrigin : null;
  const initialPollOptions = isPoll
    ? (Array.isArray(data.pollOptions) && data.pollOptions.length > 0 ? data.pollOptions : extractPollOptions(data.text))
    : [];

  const [pollState, setPollState] = useState(initialPollOptions);
  const [selectedPollOptionId, setSelectedPollOptionId] = useState(null);

  const pollQuestion = isPoll
    ? String(data.text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^\d+\)\s+/.test(line))[0]
    : null;

  const totalPollVotes = useMemo(
    () => pollState.reduce((sum, option) => sum + (option.votes || 0), 0),
    [pollState]
  );

  const handleVotePoll = (optionId) => {
    if (selectedPollOptionId) return;

    setSelectedPollOptionId(optionId);
    setPollState((prev) =>
      prev.map((option) => (
        option.id === optionId
          ? { ...option, votes: (option.votes || 0) + 1 }
          : option
      ))
    );
  };

  return (
    <View style={[styles.container, isGig && styles.gigContainer]}>

      {isGig && (
        <View style={styles.gigBadge}>
          <Ionicons name="skull" size={14} color="#000" style={{ marginRight: 6 }} />
          <Text style={styles.gigBadgeText}>CHAMADO ABERTO • CACHÊ: {data.cache}</Text>
        </View>
      )}
      
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <ProfileAvatar
          uri={data.authorAvatarUrl}
          name={data.author}
          variant={data.authorAvatarFallbackStyle || 'sigil'}
          size={42}
          borderWidth={0}
          style={styles.avatarContainer}
        />
        <View style={styles.authorBlock}>
          <View style={styles.authorTopRow}>
            <Text style={styles.name} numberOfLines={1}>{data.author}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.handle} numberOfLines={1}>{data.handle}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.handle}>{data.time}</Text>
          </View>
          <Text style={styles.typeBadge}>{TYPE_LABELS[data.type] || 'POST'}</Text>
        </View>
        <TouchableOpacity style={styles.moreIcon} onPress={() => onMorePress?.(data.id)} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {!!data.title && !isEvent && (
        <Text style={styles.postTitle}>{data.title}</Text>
      )}

      {isShare && (
        <View style={styles.shareHeaderBox}>
          <Ionicons name="repeat-outline" size={14} color={THEME.colors.primary} />
          <Text style={styles.shareHeaderText} numberOfLines={1}>
            Compartilhamento de {sharedOrigin?.author || 'autor desconhecido'}
          </Text>
        </View>
      )}

      {/* CONTEÚDO */}
      {!isPoll && !isEvent && (
        <Text style={[styles.content, isGig && styles.gigContent, isConversation && styles.conversationContent]}>
          {data.text}
        </Text>
      )}

      {isConversation && (
        <View style={styles.conversationBox}>
          <Ionicons name="chatbubbles-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.conversationHint}>Espaço aberto para debate — puxe a conversa.</Text>
        </View>
      )}

      {isShare && !!sharedOrigin && (
        <TouchableOpacity
          style={styles.sharedOriginCard}
          activeOpacity={0.9}
          onPress={() => onOpenSharedOrigin?.(sharedOrigin.id)}
        >
          <Text style={styles.sharedOriginMeta}>{sharedOrigin.author} {sharedOrigin.handle ? `• ${sharedOrigin.handle}` : ''}</Text>
          {!!sharedOrigin.title && (
            <Text style={styles.sharedOriginTitle} numberOfLines={1}>{sharedOrigin.title}</Text>
          )}
          <Text style={styles.sharedOriginText} numberOfLines={2}>{sharedOrigin.text || 'Sem descrição.'}</Text>
        </TouchableOpacity>
      )}

      {isEvent && (
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{data.title || 'Evento'}</Text>

          {!!eventAvailability && (
            <View
              style={[
                styles.eventAvailabilityBadge,
                eventAvailability.status === 'full'
                  ? styles.eventAvailabilityBadgeFull
                  : eventAvailability.status === 'last'
                    ? styles.eventAvailabilityBadgeLast
                    : styles.eventAvailabilityBadgeAvailable,
              ]}
            >
              <Text style={styles.eventAvailabilityBadgeText}>{eventAvailability.label}</Text>
            </View>
          )}

          <Text style={styles.eventText}>{data.text}</Text>

          <View style={styles.eventMetaRow}>
            <Ionicons name="calendar-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.eventMetaText}>{data.date || 'Data a definir'}</Text>
          </View>

          <View style={styles.eventMetaRow}>
            <Ionicons name="location-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.eventMetaText}>{data.location || 'Local a definir'}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.eventCta,
              eventPresenceConfirmed && styles.eventCtaConfirmed,
              eventWaitlisted && styles.eventCtaWaitlisted,
            ]}
            onPress={() => {
              if (eventPresenceConfirmed || eventWaitlisted) return;
              onConfirmEvent?.(data.id);
            }}
          >
            <Ionicons
              name={
                eventPresenceConfirmed
                  ? 'checkmark-circle-outline'
                  : eventWaitlisted
                    ? 'time-outline'
                    : isEventFullForNewConfirm
                      ? 'hourglass-outline'
                      : 'ticket-outline'
              }
              size={15}
              color={eventPresenceConfirmed ? '#000' : (eventWaitlisted ? '#D0D0D0' : THEME.colors.primary)}
            />
            <Text
              style={[
                styles.eventCtaText,
                eventPresenceConfirmed && styles.eventCtaTextConfirmed,
                eventWaitlisted && styles.eventCtaTextWaitlisted,
              ]}
            >
              {eventPresenceConfirmed
                ? 'Presença confirmada'
                : eventWaitlisted
                  ? 'Na lista de espera'
                  : isEventFullForNewConfirm
                    ? 'Entrar na lista de espera'
                    : 'Confirmar presença'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isPoll && (
        <View style={styles.pollCard}>
          <Text style={styles.pollQuestion}>{pollQuestion || 'Escolha uma opção:'}</Text>

          {(pollState.length ? pollState : [
            { id: 'poll_a', label: 'Opção A', votes: 0 },
            { id: 'poll_b', label: 'Opção B', votes: 0 },
          ]).map((option) => {
            const votes = option.votes || 0;
            const percentage = totalPollVotes > 0 ? Math.round((votes / totalPollVotes) * 100) : 0;
            const selected = selectedPollOptionId === option.id;

            return (
              <PressScale
                key={option.id || option.label}
                style={styles.pollOptionWrap}
                onPress={() => handleVotePoll(option.id)}
                disabled={!!selectedPollOptionId}
              >
                <View style={[styles.pollOption, selected && styles.pollOptionSelected]}>
                  <View style={styles.pollOptionTop}>
                    <Text style={styles.pollOptionText}>{option.label}</Text>
                    <Text style={styles.pollPercent}>{percentage}%</Text>
                  </View>
                  <View style={styles.pollBarTrack}>
                    <View style={[styles.pollBarFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              </PressScale>
            );
          })}

          {!selectedPollOptionId && (
            <Text style={styles.pollHint}>Toque para votar</Text>
          )}
        </View>
      )}
      
      {data.image && !isGig && (
        data.imageUrl ? (
          <Image source={{ uri: data.imageUrl }} style={styles.postImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#333" />
              <Text style={{color: '#333', marginTop: 8}}>Imagem do Ritual</Text>
          </View>
        )
      )}

      {isGig && userProfile === 'artist' && (
        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Button
            title="Oferecer Tributo (Candidatar-se)"
            type="primary"
            onPress={() => onApplyGig?.(data.id)}
          />
        </View>
      )}

      {/* RODAPÉ (AÇÕES) */}
      <View style={styles.footer}>
        {data.allowComments ? (
          <PressScale style={styles.actionButtonWrap}>
            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#848484" />
              <Text style={styles.actionText}>{formatCompactCount(data.comments)}</Text>
            </View>
          </PressScale>
        ) : <View style={styles.actionSlot} />}

        <PressScale style={styles.actionButtonWrap} onPress={() => onShare?.(data.id)}>
          <View style={styles.actionButton}>
            <Ionicons name="repeat-outline" size={20} color="#848484" />
            <Text style={styles.actionText}>{formatCompactCount(data.shares)}</Text>
          </View>
        </PressScale>

        <PressScale style={styles.actionButtonWrap} onPress={() => onToggleLike?.(data.id)}>
          <View style={styles.actionButton}>
            <Ionicons name={likedByCurrentUser ? 'flame' : 'flame-outline'} size={21} color={THEME.colors.primary} />
            <Text style={[styles.actionText, styles.likeActionText]}>{formatCompactCount(data.likes)}</Text>
          </View>
        </PressScale>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1D1D',
    backgroundColor: THEME.colors.background,
  },
  gigContainer: {
    backgroundColor: 'rgba(255, 200, 0, 0.03)',
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  gigBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  gigBadgeText: {
    fontFamily: 'Lato_700Bold',
    color: '#000',
    fontSize: 10,
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary, //
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorBlock: {
    flex: 1,
    paddingTop: 1,
  },
  authorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Lato_700Bold',
    color: '#F2F2F2',
    fontSize: 15,
    maxWidth: '52%',
  },
  metaDot: {
    marginHorizontal: 6,
    color: '#5F5F5F',
    fontSize: 11,
  },
  handle: {
    fontFamily: 'Lato_400Regular',
    color: '#7C7C7C',
    fontSize: 12,
  },
  moreIcon: {
    marginLeft: 'auto',
    marginTop: 1,
  },
  content: {
    fontFamily: 'Lato_400Regular',
    color: '#ECECEC',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 10,
  },
  gigContent: {
    fontFamily: 'Lato_700Bold',
    color: '#EEE',
  },
  postTitle: {
    fontFamily: 'Lato_700Bold',
    color: '#F4F4F4',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 5,
  },
  conversationContent: {
    marginBottom: 8,
  },
  conversationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  conversationHint: {
    color: '#D0B46A',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  shareHeaderBox: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareHeaderText: {
    color: '#BFA35A',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    flex: 1,
  },
  sharedOriginCard: {
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 12,
    backgroundColor: '#151515',
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginBottom: 10,
  },
  sharedOriginMeta: {
    color: '#8E8E8E',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    marginBottom: 4,
  },
  sharedOriginTitle: {
    color: '#DCDCDC',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    marginBottom: 3,
  },
  sharedOriginText: {
    color: '#AFAFAF',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 12,
    backgroundColor: '#171717',
    padding: 12,
    marginBottom: 10,
  },
  eventTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 17,
    marginBottom: 6,
  },
  eventAvailabilityBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 8,
  },
  eventAvailabilityBadgeAvailable: {
    borderColor: '#3E3E3E',
    backgroundColor: '#1F1F1F',
  },
  eventAvailabilityBadgeLast: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(255, 200, 0, 0.08)',
  },
  eventAvailabilityBadgeFull: {
    borderColor: '#444',
    backgroundColor: '#222',
  },
  eventAvailabilityBadgeText: {
    color: '#D3D3D3',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  eventText: {
    color: '#DADADA',
    fontFamily: 'Lato_400Regular',
    marginBottom: 10,
    lineHeight: 20,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventMetaText: {
    marginLeft: 8,
    color: '#BDBDBD',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  eventCta: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 200, 0, 0.04)',
  },
  eventCtaConfirmed: {
    backgroundColor: THEME.colors.primary,
  },
  eventCtaWaitlisted: {
    borderColor: '#4A4A4A',
    backgroundColor: '#1E1E1E',
  },
  eventCtaText: {
    marginLeft: 6,
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  eventCtaTextConfirmed: {
    color: '#000',
  },
  eventCtaTextWaitlisted: {
    color: '#D8D8D8',
  },
  pollCard: {
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 12,
    backgroundColor: '#161616',
    padding: 12,
    marginBottom: 10,
  },
  pollQuestion: {
    color: '#EEE',
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
    marginBottom: 10,
  },
  pollOption: {
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#101010',
    marginBottom: 8,
  },
  pollOptionWrap: {
    borderRadius: 8,
  },
  pollOptionSelected: {
    borderColor: THEME.colors.primary,
  },
  pollOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionText: {
    color: '#D5D5D5',
    fontFamily: 'Lato_700Bold',
  },
  pollPercent: {
    color: '#BEBEBE',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  pollBarTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    overflow: 'hidden',
  },
  pollBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  pollHint: {
    marginTop: 4,
    color: '#7E7E7E',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    textAlign: 'right',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#111',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#202020',
    paddingTop: 8,
  },
  actionSlot: {
    width: 78,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 78,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  actionButtonWrap: {
    borderRadius: 14,
  },
  actionText: {
    color: '#8F8F8F',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Lato_700Bold',
  },
  likeActionText: {
    color: THEME.colors.primary,
  },
  typeBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    color: '#868686',
    fontSize: 11,
    fontFamily: 'Lato_700Bold',
  }
});