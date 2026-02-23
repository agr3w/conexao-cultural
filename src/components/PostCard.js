import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from './Button';
import ProfileAvatar from './ProfileAvatar';

const TYPE_LABELS = {
  event: 'EVENTO',
  post: 'POST',
  conversation: 'CONVERSA',
  poll: 'ENQUETE',
  gig: 'CHAMADO',
  share: 'COMPARTILHAMENTO',
};

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
}) {
  const isGig = data.type === 'gig';
  const isPoll = data.type === 'poll';
  const isEvent = data.type === 'event';
  const isConversation = data.type === 'conversation';
  const isShare = data.type === 'share';
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
          size={40}
          borderWidth={0}
          style={styles.avatarContainer}
        />
        <View>
          <Text style={styles.name}>{data.author}</Text>
          <Text style={styles.handle}>{data.handle} • {data.time}</Text>
          <Text style={styles.typeBadge}>{TYPE_LABELS[data.type] || 'POST'}</Text>
        </View>
        <TouchableOpacity style={styles.moreIcon} onPress={() => onMorePress?.(data.id)}>
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
          <Text style={styles.eventText}>{data.text}</Text>

          <View style={styles.eventMetaRow}>
            <Ionicons name="calendar-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.eventMetaText}>{data.date || 'Data a definir'}</Text>
          </View>

          <View style={styles.eventMetaRow}>
            <Ionicons name="location-outline" size={15} color={THEME.colors.primary} />
            <Text style={styles.eventMetaText}>{data.location || 'Local a definir'}</Text>
          </View>
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
            onPress={() => alert('Sua alma foi oferecida para este chamado!')}
          />
        </View>
      )}

      {/* RODAPÉ (AÇÕES) */}
      <View style={styles.footer}>
        
        {/* LADO ESQUERDO: Conversa e Compartilhar */}
        <View style={styles.leftActions}>
          {data.allowComments && (
            <PressScale style={styles.actionButtonWrap}>
              <View style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color="#888" />
                <Text style={styles.actionText}>{data.comments}</Text>
              </View>
            </PressScale>
          )}

          <PressScale style={styles.actionButtonWrap} onPress={() => onShare?.(data.id)}>
            <View style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={22} color="#888" />
              {!!Number(data.shares || 0) && (
                <Text style={styles.actionText}>{Number(data.shares || 0)}</Text>
              )}
            </View>
          </PressScale>
        </View>

        {/* LADO DIREITO: A Chama (Like) */}
        <PressScale style={styles.actionButtonWrap} onPress={() => onToggleLike?.(data.id)}>
          <View style={[styles.actionButton, styles.likeButton]}>
              <Text style={[styles.actionText, { color: THEME.colors.primary, marginRight: 6 }]}>
                  {data.likes}
              </Text>
              <Ionicons name={likedByCurrentUser ? 'flame' : 'flame-outline'} size={24} color={THEME.colors.primary} />
          </View>
        </PressScale>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary, //
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    fontFamily: 'Cinzel_700Bold', //
    color: THEME.colors.primary, //
    fontSize: 16,
  },
  handle: {
    fontFamily: 'Lato_400Regular', //
    color: '#666',
    fontSize: 12,
  },
  moreIcon: {
    marginLeft: 'auto',
  },
  content: {
    fontFamily: 'Lato_400Regular', //
    color: THEME.colors.text, //
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  gigContent: {
    fontFamily: 'Lato_700Bold',
    color: '#EEE',
  },
  postTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: '#EEE',
    fontSize: 17,
    marginBottom: 6,
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
    marginBottom: 10,
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
    borderRadius: 10,
    backgroundColor: '#151515',
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 12,
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
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#171717',
    padding: 12,
    marginBottom: 12,
  },
  eventTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 17,
    marginBottom: 6,
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
  pollCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#161616',
    padding: 12,
    marginBottom: 12,
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
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#111',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Separa esquerda e direita
    alignItems: 'center',
    marginTop: 4,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 20, // Espaço entre chat e share
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonWrap: {
    borderRadius: 14,
  },
  likeButton: {
    // Pode adicionar um estilo extra aqui se quiser destacar mais a chama
  },
  actionText: {
    color: '#888',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Lato_400Regular', //
  },
  typeBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#999',
    fontSize: 10,
    fontFamily: 'Lato_700Bold',
  }
});