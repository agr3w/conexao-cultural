import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import PostCard from '../components/PostCard';
import ImageActionButtons from '../components/ImageActionButtons';
import { createPost, getVisibleFeedPosts } from '../service/feedPosts';
import { listArtistProfilesByOwner } from '../service/artistProfiles';
import { pickImageFromCamera, pickImageFromLibrary } from '../service/mediaPicker';

const COMPOSE_TYPES = [
  { id: 'post', label: 'Post', icon: 'create-outline' },
  { id: 'conversation', label: 'Conversa', icon: 'chatbubbles-outline' },
  { id: 'poll', label: 'Enquete', icon: 'stats-chart-outline' },
  { id: 'event', label: 'Evento', icon: 'calendar-outline' },
  { id: 'gig', label: 'Chamado', icon: 'flash-outline', artistOnly: true },
];

function FeedPostPressCard({ item, userProfile, onPostClick }) {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.985,
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

  const handleOpenPost = () => {
    Animated.timing(pressAnim, {
      toValue: 0.992,
      duration: 70,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }).start();

      onPostClick(item);
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressAnim }], opacity: pressAnim }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleOpenPost}
        activeOpacity={0.96}
      >
        <PostCard data={item} userProfile={userProfile} />
      </TouchableOpacity>
    </Animated.View>
  );
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

export default function Feed({
  onOpenMenu,
  onPostClick,
  onOpenComposer,
  userProfile = 'viewer',
  onBandPostCreated,
  refreshTick = 0,
  ownerUserId = 'u_artist_1',
  artistProfileId,
  currentUserName = 'Viajante do Caos',
  currentUserHandle = '@viajante_01',
  currentUserAvatarUrl = '',
  currentUserAvatarFallbackStyle = 'sigil',
}) {
  const isArtist = userProfile === 'artist';
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [audience, setAudience] = useState('public');
  const [postType, setPostType] = useState('post');
  const [pollOptionsText, setPollOptionsText] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventSanityLevel, setEventSanityLevel] = useState('3');
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPriceLabel, setEventPriceLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [conversationPrompt, setConversationPrompt] = useState('');
  const [gigCache, setGigCache] = useState('');

  const artistProfiles = useMemo(() => listArtistProfilesByOwner(ownerUserId), [ownerUserId]);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState(
    artistProfileId ?? artistProfiles[0]?.id ?? null
  );

  useEffect(() => {
    if (artistProfileId) setSelectedArtistProfileId(artistProfileId);
  }, [artistProfileId]);

  const visiblePosts = useMemo(
    () => getVisibleFeedPosts(userProfile),
    [userProfile, refreshTick]
  );

  const availableComposeTypes = useMemo(
    () => COMPOSE_TYPES.filter((item) => !item.artistOnly || isArtist),
    [isArtist]
  );

  const handlePublishBandPost = () => {
    try {
      const parsedPollOptions = pollOptionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      createPost({
        userProfile,
        artistProfileId: selectedArtistProfileId,
        author: currentUserName,
        handle: currentUserHandle,
        authorAvatarUrl: currentUserAvatarUrl,
        authorAvatarFallbackStyle: currentUserAvatarFallbackStyle,
        type: postType,
        title: newTitle,
        text: newText,
        audience: isArtist ? audience : 'public',
        pollOptions: parsedPollOptions,
        eventDate,
        eventLocation,
        sanityLevel: Number(eventSanityLevel),
        isPaid: eventIsPaid,
        priceLabel: eventPriceLabel,
        image: Boolean(imageUrl),
        imageUrl,
        conversationPrompt,
        cache: gigCache,
      });

      setNewTitle('');
      setNewText('');
      setAudience('public');
      setPostType('post');
      setPollOptionsText('');
      setEventDate('');
      setEventLocation('');
      setEventSanityLevel('3');
      setEventIsPaid(false);
      setEventPriceLabel('');
      setImageUrl('');
      setImagePreviewError(false);
      setConversationPrompt('');
      setGigCache('');
      setComposerOpen(false);
      onBandPostCreated?.();
      if (isArtist) {
        alert(audience === 'community' ? 'Post enviado só para a comunidade VIP.' : 'Post publicado para todos.');
      } else {
        alert('Post publicado no feed geral.');
      }
    } catch (error) {
      alert(error?.message || 'Não foi possível publicar agora.');
    }
  };

  const handleOpenComposer = () => {
    if (isArtist && artistProfiles.length === 0) {
      alert('Cadastre um perfil de banda no setup antes de publicar.');
      return;
    }
    if (!isArtist) {
      setAudience('public');
    }
    setComposerOpen(true);
  };

  const handlePickImageFromLibrary = async () => {
    try {
      const uri = await pickImageFromLibrary();
      if (uri) {
        setImageUrl(uri);
        setImagePreviewError(false);
      }
    } catch (error) {
      alert(error?.message || 'Não foi possível abrir a galeria.');
    }
  };

  const handlePickImageFromCamera = async () => {
    try {
      const uri = await pickImageFromCamera();
      if (uri) {
        setImageUrl(uri);
        setImagePreviewError(false);
      }
    } catch (error) {
      alert(error?.message || 'Não foi possível abrir a câmera.');
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreviewError(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FIXO (Topo) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenMenu}>
          <Ionicons name="menu-outline" size={28} color={THEME.colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>O CAOS</Text>

        <View style={styles.userMetaWrap}>
          <Text style={styles.userMetaName}>{currentUserName}</Text>
          <Text style={styles.userMetaHandle}>{currentUserHandle}</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* LISTA DE POSTS */}
      <FlatList
        data={visiblePosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FeedPostPressCard
            item={item}
            userProfile={userProfile}
            onPostClick={onPostClick}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} // Espaço para o botão flutuante
      />

      <TouchableOpacity style={styles.fab} onPress={onOpenComposer}>
        <Ionicons name="pencil" size={24} color={THEME.colors.textDark} />
      </TouchableOpacity>

      <Modal visible={composerOpen} transparent animationType="fade" onRequestClose={() => setComposerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isArtist ? 'Publicar para fãs' : 'Novo Post'}</Text>

            <View style={styles.typesRow}>
              {availableComposeTypes.map((item) => {
                const active = postType === item.id;
                return (
                  <PressScale
                    key={item.id}
                    style={[styles.typeChipWrap]}
                    onPress={() => setPostType(item.id)}
                  >
                    <View style={[styles.typeChip, active && styles.typeChipActive]}>
                      <Ionicons name={item.icon} size={14} color={active ? '#000' : '#B9B9B9'} style={{ marginRight: 4 }} />
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{item.label}</Text>
                    </View>
                  </PressScale>
                );
              })}
            </View>

            {isArtist ? (
              <View style={styles.profileRow}>
                <PressScale
                  style={styles.profileChipWrap}
                  onPress={() => setAudience('public')}
                >
                  <View style={[styles.profileChip, audience === 'public' && styles.profileChipActive]}>
                    <Text style={[styles.profileChipText, audience === 'public' && styles.profileChipTextActive]}>
                      Todos
                    </Text>
                  </View>
                </PressScale>
                <PressScale
                  style={styles.profileChipWrap}
                  onPress={() => setAudience('community')}
                >
                  <View style={[styles.profileChip, audience === 'community' && styles.profileChipActive]}>
                    <Text style={[styles.profileChipText, audience === 'community' && styles.profileChipTextActive]}>
                      Só Comunidade
                    </Text>
                  </View>
                </PressScale>
              </View>
            ) : (
              <Text style={styles.modalScope}>Escopo: Feed Geral</Text>
            )}

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder={postType === 'event' ? 'Título do Evento' : postType === 'poll' ? 'Pergunta da enquete' : 'Título (opcional)'}
              placeholderTextColor="#666"
              style={styles.input}
            />

            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder={
                postType === 'conversation'
                  ? 'Abra uma conversa para a galera participar...'
                  : postType === 'event'
                    ? 'Descrição completa do evento...'
                    : postType === 'poll'
                      ? 'Contexto da enquete (opcional)...'
                      : postType === 'gig'
                        ? 'Descreva os detalhes do chamado...'
                        : 'Conte a novidade...'
              }
              placeholderTextColor="#666"
              style={[styles.input, styles.inputTextArea]}
              multiline
            />

            {postType === 'conversation' && (
              <TextInput
                value={conversationPrompt}
                onChangeText={setConversationPrompt}
                placeholder="Pergunta disparadora (opcional)"
                placeholderTextColor="#666"
                style={styles.input}
              />
            )}

            {postType === 'poll' && (
              <TextInput
                value={pollOptionsText}
                onChangeText={setPollOptionsText}
                placeholder={'Opções da enquete (uma por linha)\nEx:\nRock\nJazz\nMetal'}
                placeholderTextColor="#666"
                style={[styles.input, styles.inputTextArea]}
                multiline
              />
            )}

            {postType === 'event' && (
              <>
                <TextInput
                  value={eventDate}
                  onChangeText={setEventDate}
                  placeholder="Data e hora (ex: Sexta 13 • 22:00)"
                  placeholderTextColor="#666"
                  style={styles.input}
                />

                <TextInput
                  value={eventLocation}
                  onChangeText={setEventLocation}
                  placeholder="Local do evento"
                  placeholderTextColor="#666"
                  style={styles.input}
                />

                <View style={styles.rowMeta}>
                  <Text style={styles.metaLabel}>Sanidade:</Text>
                  {[1, 2, 3, 4, 5].map((level) => {
                    const active = Number(eventSanityLevel) === level;
                    return (
                      <PressScale
                        key={level}
                        style={styles.levelChipWrap}
                        onPress={() => setEventSanityLevel(String(level))}
                      >
                        <View style={[styles.levelChip, active && styles.levelChipActive]}>
                          <Text style={[styles.levelChipText, active && styles.levelChipTextActive]}>{level}</Text>
                        </View>
                      </PressScale>
                    );
                  })}
                </View>

                <View style={styles.rowMeta}>
                  <Text style={styles.metaLabel}>Evento pago:</Text>
                  <PressScale
                    style={styles.scopeMiniWrap}
                    onPress={() => setEventIsPaid((prev) => !prev)}
                  >
                    <View style={[styles.scopeMini, eventIsPaid && styles.scopeMiniActive]}>
                      <Text style={[styles.scopeMiniText, eventIsPaid && styles.scopeMiniTextActive]}>
                        {eventIsPaid ? 'Sim' : 'Não'}
                      </Text>
                    </View>
                  </PressScale>
                </View>

                {eventIsPaid && (
                  <TextInput
                    value={eventPriceLabel}
                    onChangeText={setEventPriceLabel}
                    placeholder="Tributo / ingresso (ex: R$ 30,00)"
                    placeholderTextColor="#666"
                    style={styles.input}
                  />
                )}
              </>
            )}

            {postType === 'gig' && (
              <TextInput
                value={gigCache}
                onChangeText={setGigCache}
                placeholder="Cachê (ex: R$ 1.200 + consumo)"
                placeholderTextColor="#666"
                style={styles.input}
              />
            )}

            {(postType === 'post' || postType === 'conversation' || postType === 'event') && (
              <>
                <Text style={styles.mediaLabel}>Imagem do ritual (opcional)</Text>

                <ImageActionButtons
                  onPickLibrary={handlePickImageFromLibrary}
                  onPickCamera={handlePickImageFromCamera}
                  onRemove={handleRemoveImage}
                />

                {!!imageUrl.trim() && (
                  <View style={styles.imagePreviewCard}>
                    {!imagePreviewError ? (
                      <Image
                        source={{ uri: imageUrl.trim() }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                        onError={() => setImagePreviewError(true)}
                      />
                    ) : (
                      <View style={styles.imagePreviewFallback}>
                        <Ionicons name="alert-circle-outline" size={18} color="#C09A4A" />
                        <Text style={styles.imagePreviewFallbackText}>Não foi possível carregar a imagem.</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            <View style={styles.modalActions}>
              <PressScale style={styles.modalActionWrap} onPress={() => setComposerOpen(false)}>
                <View style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </View>
              </PressScale>
              <PressScale style={styles.modalActionWrap} onPress={handlePublishBandPost}>
                <View style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Publicar</Text>
                </View>
              </PressScale>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background, //
    paddingTop: 30, // Para não colar na barra de status do Android
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontFamily: 'Cinzel_700Bold', //
    fontSize: 20,
    color: THEME.colors.primary, //
    letterSpacing: 2,
  },
  userMetaWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMetaName: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  userMetaHandle: {
    color: '#777',
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    marginTop: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primary, //
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 12,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
  },
  modalTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
  },
  modalScope: {
    color: '#A0A0A0',
    fontFamily: 'Lato_400Regular',
    marginTop: 10,
    marginBottom: 8,
  },
  modalHint: {
    color: '#999',
    fontFamily: 'Lato_400Regular',
    marginTop: 6,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#101010',
    color: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: 'Lato_400Regular',
  },
  inputTextArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalActionWrap: {
    borderRadius: 8,
  },
  btnGhostText: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
  },
  btnPrimary: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnPrimaryText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
  },
  profileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  profileChipWrap: {
    borderRadius: 14,
  },
  profileChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  profileChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  profileChipText: { color: '#CCC', fontFamily: 'Lato_700Bold', fontSize: 12 },
  profileChipTextActive: { color: '#000' },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    marginBottom: 8,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChipWrap: {
    borderRadius: 14,
  },
  typeChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  typeChipText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  typeChipTextActive: {
    color: '#000',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaLabel: {
    color: '#AAA',
    fontFamily: 'Lato_700Bold',
    marginRight: 4,
  },
  levelChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelChipWrap: {
    borderRadius: 12,
  },
  levelChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  levelChipText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  levelChipTextActive: {
    color: '#000',
  },
  scopeMini: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scopeMiniWrap: {
    borderRadius: 12,
  },
  scopeMiniActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  scopeMiniText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  scopeMiniTextActive: {
    color: '#000',
  },
  imagePreviewCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#111',
  },
  imagePreview: {
    width: '100%',
    height: 160,
  },
  imagePreviewFallback: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePreviewFallbackText: {
    color: '#C09A4A',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  mediaLabel: {
    color: '#999',
    fontFamily: 'Lato_700Bold',
    marginBottom: 4,
  },
});