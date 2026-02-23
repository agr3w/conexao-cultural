import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput, Image, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { THEME } from '../styles/colors';
import PostCard from '../components/PostCard';
import ImageActionButtons from '../components/ImageActionButtons';
import {
  createPost,
  getVisibleFeedPosts,
  getPostById,
  getPostPublicLink,
  hidePostForOwner,
  reportPost,
  togglePostLike,
  sharePost,
  updatePostContent,
} from '../service/feedPosts';
import { listArtistProfilesByOwner } from '../service/artistProfiles';
import { pickImageFromCamera, pickImageFromLibrary } from '../service/mediaPicker';

const COMPOSE_TYPES = [
  { id: 'post', label: 'Post', icon: 'create-outline' },
  { id: 'conversation', label: 'Conversa', icon: 'chatbubbles-outline' },
  { id: 'poll', label: 'Enquete', icon: 'stats-chart-outline' },
  { id: 'event', label: 'Evento', icon: 'calendar-outline' },
  { id: 'gig', label: 'Chamado', icon: 'flash-outline', artistOnly: true },
];

function FeedPostPressCard({
  item,
  userProfile,
  onPostClick,
  likedByCurrentUser,
  onToggleLike,
  onShare,
  onOpenSharedOrigin,
  onMorePress,
}) {
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
        <PostCard
          data={item}
          userProfile={userProfile}
          likedByCurrentUser={likedByCurrentUser}
          onToggleLike={onToggleLike}
          onShare={onShare}
          onOpenSharedOrigin={onOpenSharedOrigin}
          onMorePress={onMorePress}
        />
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
  likeOwnerUserId = 'u_viewer_1',
  onLikeChanged,
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
  const [likeTick, setLikeTick] = useState(0);
  const [shareTick, setShareTick] = useState(0);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [repostCommentOpen, setRepostCommentOpen] = useState(false);
  const [shareTargetPostId, setShareTargetPostId] = useState(null);
  const [shareCommentText, setShareCommentText] = useState('');
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [postMenuTargetId, setPostMenuTargetId] = useState(null);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');

  const artistProfiles = useMemo(() => listArtistProfilesByOwner(ownerUserId), [ownerUserId]);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState(
    artistProfileId ?? artistProfiles[0]?.id ?? null
  );

  useEffect(() => {
    if (artistProfileId) setSelectedArtistProfileId(artistProfileId);
  }, [artistProfileId]);

  const visiblePosts = useMemo(
    () => getVisibleFeedPosts(userProfile, likeOwnerUserId),
    [userProfile, refreshTick, likeTick, shareTick]
  );

  const selectedMenuPost = useMemo(
    () => getPostById(postMenuTargetId),
    [postMenuTargetId, refreshTick, likeTick, shareTick]
  );

  const canEditSelectedPost = selectedMenuPost?.ownerUserId === likeOwnerUserId;

  const handleToggleLike = (postId) => {
    try {
      togglePostLike(postId, likeOwnerUserId);
      setLikeTick((prev) => prev + 1);
      onLikeChanged?.();
    } catch (error) {
      alert(error?.message || 'Não foi possível registrar a curtida.');
    }
  };

  const shareTargetPost = useMemo(
    () => visiblePosts.find((post) => post.id === shareTargetPostId) || null,
    [visiblePosts, shareTargetPostId]
  );

  const openShareModal = (postId) => {
    setShareTargetPostId(postId);
    setShareCommentText('');
    setRepostCommentOpen(false);
    setRepostMenuOpen(true);
  };

  const closeShareFlow = () => {
    setRepostMenuOpen(false);
    setRepostCommentOpen(false);
    setShareTargetPostId(null);
    setShareCommentText('');
  };

  const openShareCommentComposer = () => {
    setRepostMenuOpen(false);
    setRepostCommentOpen(true);
  };

  const openPostMenu = (postId) => {
    setPostMenuTargetId(postId);
    setPostMenuOpen(true);
  };

  const closePostMenu = () => {
    setPostMenuOpen(false);
    setPostMenuTargetId(null);
  };

  const openEditPostModal = () => {
    if (!selectedMenuPost) return;
    if (!canEditSelectedPost) {
      alert('Você só pode editar posts criados por você.');
      return;
    }

    setEditTitle(selectedMenuPost?.title || '');
    setEditText(selectedMenuPost?.text || '');
    setPostMenuOpen(false);
    setEditPostModalOpen(true);
  };

  const closeEditPostModal = () => {
    setEditPostModalOpen(false);
    setEditTitle('');
    setEditText('');
  };

  const saveEditedPost = () => {
    if (!selectedMenuPost?.id) return;

    try {
      updatePostContent({
        postId: selectedMenuPost.id,
        ownerUserId: likeOwnerUserId,
        title: editTitle,
        text: editText,
      });

      setShareTick((prev) => prev + 1);
      onBandPostCreated?.();
      closeEditPostModal();
      alert('Post atualizado com sucesso.');
    } catch (error) {
      alert(error?.message || 'Não foi possível salvar as edições.');
    }
  };

  const handleCopyLink = async () => {
    if (!selectedMenuPost?.id) return;

    try {
      const link = getPostPublicLink(selectedMenuPost.id);
      await Clipboard.setStringAsync(link);
      closePostMenu();
      alert('Link copiado para a área de transferência.');
    } catch (error) {
      alert('Não foi possível copiar o link agora.');
    }
  };

  const handleExternalShare = async () => {
    if (!selectedMenuPost?.id) return;

    const link = getPostPublicLink(selectedMenuPost.id);
    const message = `${selectedMenuPost.title || selectedMenuPost.author}\n${selectedMenuPost.text || ''}\n\n${link}`;

    try {
      await Share.share({ message });
      closePostMenu();
    } catch (error) {
      alert('Não foi possível abrir o compartilhamento externo.');
    }
  };

  const handleReportPost = () => {
    if (!selectedMenuPost?.id) return;

    try {
      reportPost(selectedMenuPost.id, likeOwnerUserId, 'conteúdo inapropriado');
      closePostMenu();
      alert('Denúncia enviada. Obrigado por avisar.');
    } catch (error) {
      alert(error?.message || 'Não foi possível denunciar este post.');
    }
  };

  const handleHidePost = () => {
    if (!selectedMenuPost?.id) return;

    try {
      hidePostForOwner(selectedMenuPost.id, likeOwnerUserId);
      setShareTick((prev) => prev + 1);
      onBandPostCreated?.();
      closePostMenu();
      alert('Post ocultado do seu feed.');
    } catch (error) {
      alert(error?.message || 'Não foi possível ocultar este post.');
    }
  };

  const publishShare = (withComment = false) => {
    if (!shareTargetPostId) {
      alert('Selecione um post para compartilhar.');
      return;
    }

    const safeComment = String(shareCommentText || '').trim();
    if (withComment && safeComment.length < 3) {
      alert('Escreva um comentário com pelo menos 3 caracteres.');
      return;
    }

    try {
      sharePost({
        postId: shareTargetPostId,
        ownerUserId: likeOwnerUserId,
        author: currentUserName,
        handle: currentUserHandle,
        authorKind: isArtist ? 'artist' : 'viewer',
        authorAvatarUrl: currentUserAvatarUrl,
        authorAvatarFallbackStyle: currentUserAvatarFallbackStyle,
        comment: withComment ? safeComment : '',
      });

      setShareTick((prev) => prev + 1);
      onBandPostCreated?.();
      closeShareFlow();
      alert(withComment ? 'Compartilhamento com comentário publicado.' : 'Post compartilhado no feed.');
    } catch (error) {
      alert(error?.message || 'Não foi possível compartilhar agora.');
    }
  };

  const openOriginalPostFromShare = (originPostId) => {
    const original = getPostById(originPostId);
    if (!original) {
      alert('Não foi possível abrir a publicação original.');
      return;
    }

    onPostClick?.(original);
  };

  const isLikedByCurrentUser = (post) => {
    const likedBy = Array.isArray(post?.likedByOwnerUserIds) ? post.likedByOwnerUserIds : [];
    return likedBy.includes(likeOwnerUserId);
  };

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
        ownerUserId: likeOwnerUserId,
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
            likedByCurrentUser={isLikedByCurrentUser(item)}
            onToggleLike={handleToggleLike}
            onShare={openShareModal}
            onOpenSharedOrigin={openOriginalPostFromShare}
            onMorePress={openPostMenu}
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

      <Modal visible={repostMenuOpen} transparent animationType="fade" onRequestClose={closeShareFlow}>
        <View style={styles.repostOverlay}>
          <View style={styles.repostSheet}>
            <TouchableOpacity style={styles.repostActionItem} onPress={() => publishShare(false)}>
              <Ionicons name="repeat-outline" size={20} color="#E7E7E7" />
              <Text style={styles.repostActionText}>Repostar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.repostActionItem} onPress={openShareCommentComposer}>
              <Ionicons name="create-outline" size={20} color="#E7E7E7" />
              <Text style={styles.repostActionText}>Comentário</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.repostActionItem, styles.repostActionCancel]} onPress={closeShareFlow}>
              <Text style={styles.repostCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={repostCommentOpen} transparent animationType="fade" onRequestClose={closeShareFlow}>
        <View style={styles.modalOverlay}>
          <View style={styles.shareQuickCard}>
            <Text style={styles.shareQuickTitle}>Repost com comentário</Text>

            <TextInput
              value={shareCommentText}
              onChangeText={setShareCommentText}
              placeholder="Escreva seu comentário"
              placeholderTextColor="#666"
              style={[styles.input, { marginTop: 8, marginBottom: 6 }]}
              multiline
            />

            <View style={styles.shareQuickActions}>
              <PressScale style={styles.shareQuickButtonWrap} onPress={closeShareFlow}>
                <View style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </View>
              </PressScale>

              <PressScale style={styles.shareQuickButtonWrap} onPress={() => publishShare(true)}>
                <View style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Publicar</Text>
                </View>
              </PressScale>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={postMenuOpen} transparent animationType="fade" onRequestClose={closePostMenu}>
        <View style={styles.modalOverlay}>
          <View style={styles.postMenuCard}>
            <Text style={styles.postMenuTitle}>Ações do post</Text>

            <TouchableOpacity
              style={[styles.postMenuItem, !canEditSelectedPost && styles.postMenuItemDisabled]}
              onPress={openEditPostModal}
              disabled={!canEditSelectedPost}
            >
              <Ionicons name="create-outline" size={16} color={canEditSelectedPost ? '#D6D6D6' : '#666'} />
              <Text style={[styles.postMenuItemText, !canEditSelectedPost && styles.postMenuItemTextDisabled]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={handleCopyLink}>
              <Ionicons name="copy-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Copiar link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={handleExternalShare}>
              <Ionicons name="logo-whatsapp" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Compartilhar externo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={handleReportPost}>
              <Ionicons name="flag-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Denunciar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={handleHidePost}>
              <Ionicons name="eye-off-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Ocultar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.postMenuItem, styles.postMenuClose]} onPress={closePostMenu}>
              <Text style={styles.postMenuCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editPostModalOpen} transparent animationType="fade" onRequestClose={closeEditPostModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.shareQuickCard}>
            <Text style={styles.shareQuickTitle}>Editar publicação</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título (opcional)"
              placeholderTextColor="#666"
              style={[styles.input, { marginBottom: 8 }]}
            />

            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Conteúdo"
              placeholderTextColor="#666"
              style={[styles.input, styles.inputTextArea, { marginBottom: 6 }]}
              multiline
            />

            <View style={styles.shareQuickActions}>
              <PressScale style={styles.shareQuickButtonWrap} onPress={closeEditPostModal}>
                <View style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </View>
              </PressScale>

              <PressScale style={styles.shareQuickButtonWrap} onPress={saveEditedPost}>
                <View style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Salvar</Text>
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
  shareQuickCard: {
    borderRadius: 12,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
  },
  shareQuickTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
    marginBottom: 6,
  },
  sharePreviewBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 10,
    backgroundColor: '#121212',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sharePreviewAuthor: {
    color: '#BFBFBF',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    marginBottom: 2,
  },
  sharePreviewText: {
    color: '#A9A9A9',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    lineHeight: 17,
  },
  shareQuickActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  shareQuickButtonWrap: {
    flex: 1,
    borderRadius: 8,
  },
  repostOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  repostSheet: {
    backgroundColor: '#101010',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: '#292929',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,
  },
  repostActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  repostActionText: {
    marginLeft: 10,
    color: '#ECECEC',
    fontFamily: 'Lato_700Bold',
    fontSize: 18,
  },
  repostActionCancel: {
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
    marginTop: 6,
  },
  repostCancelText: {
    color: '#A8A8A8',
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
  },
  postMenuCard: {
    borderRadius: 12,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
  },
  postMenuTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    marginBottom: 6,
  },
  postMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#313131',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#131313',
  },
  postMenuItemDisabled: {
    opacity: 0.45,
  },
  postMenuItemText: {
    marginLeft: 8,
    color: '#D6D6D6',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  postMenuItemTextDisabled: {
    color: '#777',
  },
  postMenuClose: {
    justifyContent: 'center',
  },
  postMenuCloseText: {
    color: '#A0A0A0',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
});