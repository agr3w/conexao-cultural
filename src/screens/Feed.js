import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Share as NativeShare } from 'react-native';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import {
  getPostById,
  getPostPublicLink,
  getVisibleFeedPosts,
  hidePostForOwner,
  reportPost,
  sharePost,
  togglePostLike,
  updatePostContent,
} from '../service/feedPosts';
import {
  addGigToAgenda,
  cancelAgendaCommitment,
  addRitualToAgenda,
  getAgendaCommitmentBySource,
} from '../service/agenda';
import { THEME } from '../styles/colors';

const SCROLL_TOP_RESET_Y = 12;
const HIDE_START_Y = 56;
const HIDE_TRIGGER_DISTANCE = 28;
const SHOW_TRIGGER_DISTANCE = 34;
const SCROLL_JITTER_GUARD = 1;
const CHROME_TOGGLE_COOLDOWN_MS = 260;
const CHROME_RETOGGLE_MIN_DISTANCE = 26;

function PressScale({ style, onPress, children }) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[style, pressed && { transform: [{ scale: 0.99 }] }]}
    >
      {children}
    </Pressable>
  );
}

export default function Feed({
  onOpenMenu,
  userProfile = 'viewer',
  ownerUserId,
  likeOwnerUserId,
  onOpenComposer,
  onPostClick,
  onBandPostCreated,
  refreshTick,
  currentUserName,
  currentUserHandle,
  currentUserAvatarUrl,
  currentUserAvatarFallbackStyle,
  onChromeVisibilityChange,
}) {
  const [localRefresh, setLocalRefresh] = useState(0);
  const [menuPost, setMenuPost] = useState(null);
  const [showShareComposer, setShowShareComposer] = useState(false);
  const [shareTargetPost, setShareTargetPost] = useState(null);
  const [shareComment, setShareComment] = useState('');
  const [editPost, setEditPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const headerVisibilityAnim = useRef(new Animated.Value(1)).current;
  const lastScrollYRef = useRef(0);
  const chromeHiddenRef = useRef(false);
  const downScrollAccumRef = useRef(0);
  const upScrollAccumRef = useRef(0);
  const isChromeAnimatingRef = useRef(false);
  const chromeToggleCooldownUntilRef = useRef(0);
  const lastChromeToggleYRef = useRef(0);

  useEffect(() => () => {
    onChromeVisibilityChange?.(false);
  }, [onChromeVisibilityChange]);

  const currentOwnerId = likeOwnerUserId || ownerUserId;

  const posts = useMemo(
    () => getVisibleFeedPosts(userProfile, currentOwnerId),
    [userProfile, currentOwnerId, localRefresh, refreshTick]
  );

  const refresh = () => {
    setLocalRefresh((prev) => prev + 1);
    onBandPostCreated?.();
  };

  const setChromeHidden = (nextHidden) => {
    const now = Date.now();

    if (now < chromeToggleCooldownUntilRef.current) {
      return;
    }

    if (chromeHiddenRef.current === nextHidden) return;

    isChromeAnimatingRef.current = true;
    chromeHiddenRef.current = nextHidden;
    onChromeVisibilityChange?.(nextHidden);
    chromeToggleCooldownUntilRef.current = now + CHROME_TOGGLE_COOLDOWN_MS;
    lastChromeToggleYRef.current = lastScrollYRef.current;
    downScrollAccumRef.current = 0;
    upScrollAccumRef.current = 0;

    Animated.timing(headerVisibilityAnim, {
      toValue: nextHidden ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      isChromeAnimatingRef.current = false;
    });
  };

  const handleFeedScroll = (event) => {
    const nextY = Math.max(0, Number(event?.nativeEvent?.contentOffset?.y || 0));

    if (isChromeAnimatingRef.current) {
      lastScrollYRef.current = nextY;
      return;
    }

    if (
      nextY > SCROLL_TOP_RESET_Y
      && Math.abs(nextY - lastChromeToggleYRef.current) < CHROME_RETOGGLE_MIN_DISTANCE
    ) {
      lastScrollYRef.current = nextY;
      return;
    }

    const delta = nextY - lastScrollYRef.current;
    lastScrollYRef.current = nextY;

    if (nextY <= SCROLL_TOP_RESET_Y) {
      setChromeHidden(false);
      downScrollAccumRef.current = 0;
      upScrollAccumRef.current = 0;
      return;
    }

    if (Math.abs(delta) < SCROLL_JITTER_GUARD) {
      return;
    }

    if (delta > 0) {
      upScrollAccumRef.current = 0;
      downScrollAccumRef.current += delta;

      if (!chromeHiddenRef.current && nextY > HIDE_START_Y && downScrollAccumRef.current >= HIDE_TRIGGER_DISTANCE) {
        setChromeHidden(true);
        downScrollAccumRef.current = 0;
      }

      return;
    }

    downScrollAccumRef.current = 0;
    upScrollAccumRef.current += Math.abs(delta);

    if (chromeHiddenRef.current && upScrollAccumRef.current >= SHOW_TRIGGER_DISTANCE) {
      setChromeHidden(false);
      upScrollAccumRef.current = 0;
    }
  };

  const getEventCommitment = (postId) => {
    if (!currentOwnerId || !postId) return null;
    return getAgendaCommitmentBySource({
      ownerUserId: currentOwnerId,
      sourceType: 'event',
      sourcePostId: postId,
    });
  };

  const isLikedByCurrentUser = (post) => {
    const likedBy = Array.isArray(post?.likedByOwnerUserIds) ? post.likedByOwnerUserIds : [];
    return likedBy.includes(currentOwnerId);
  };

  const handleToggleLike = (postId) => {
    try {
      togglePostLike(postId, currentOwnerId);
      refresh();
    } catch (error) {
      Alert.alert('Não foi possível curtir', error?.message || 'Tente novamente em instantes.');
    }
  };

  const handleCardPress = (post) => {
    onPostClick?.(post);
  };

  const openMenuById = (postId) => {
    const post = getPostById(postId);
    if (!post) return;
    setMenuPost(post);
  };

  const closeMenu = () => setMenuPost(null);

  const openShareComposer = (postIdOrPost) => {
    const post = typeof postIdOrPost === 'string' ? getPostById(postIdOrPost) : postIdOrPost;
    if (!post) return;

    closeMenu();
    setShareTargetPost(post);
    setShareComment('');
    setShowShareComposer(true);
  };

  const closeShareComposer = () => {
    setShowShareComposer(false);
    setShareTargetPost(null);
    setShareComment('');
  };

  const submitShareComposer = () => {
    if (!shareTargetPost) return;

    try {
      sharePost({
        postId: shareTargetPost.id,
        ownerUserId: currentOwnerId,
        author: currentUserName,
        handle: currentUserHandle,
        authorKind: userProfile === 'artist' ? 'artist' : 'viewer',
        authorAvatarUrl: currentUserAvatarUrl,
        authorAvatarFallbackStyle: currentUserAvatarFallbackStyle || 'sigil',
        comment: shareComment,
      });

      closeShareComposer();
      refresh();
    } catch (error) {
      Alert.alert('Não foi possível repostar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const handleCopyLink = async (post) => {
    closeMenu();

    try {
      const link = getPostPublicLink(post?.id);
      await Clipboard.setStringAsync(link);
      Alert.alert('Link copiado', 'O link do post foi copiado para a área de transferência.');
    } catch {
      Alert.alert('Não foi possível copiar', 'Tente novamente em instantes.');
    }
  };

  const handleShareNative = async (post) => {
    closeMenu();

    const message = [
      post?.title || 'Post no Conexão Cultural',
      post?.text,
      getPostPublicLink(post?.id),
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await NativeShare.share({ message });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente novamente em instantes.');
    }
  };

  const handleHidePost = (post) => {
    closeMenu();

    try {
      hidePostForOwner(post.id, currentOwnerId);
      refresh();
      Alert.alert('Post ocultado', 'Você pode restaurar em Configurações > Ocultados.');
    } catch (error) {
      Alert.alert('Não foi possível ocultar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const handleReportPost = (post) => {
    closeMenu();

    try {
      reportPost(post.id, currentOwnerId, 'inapropriado');
      Alert.alert('Reportado', 'A denúncia foi registrada para análise da moderação.');
    } catch (error) {
      Alert.alert('Não foi possível reportar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const openEditModal = (post) => {
    closeMenu();
    setEditPost(post);
    setEditTitle(post.title || '');
    setEditText(post.text || '');
  };

  const closeEditModal = () => {
    setEditPost(null);
    setEditTitle('');
    setEditText('');
  };

  const submitEditPost = () => {
    if (!editPost) return;

    try {
      updatePostContent({
        postId: editPost.id,
        ownerUserId: currentOwnerId,
        title: editTitle,
        text: editText,
      });

      closeEditModal();
      refresh();
    } catch (error) {
      Alert.alert('Não foi possível editar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const handleConfirmEvent = (postId) => {
    try {
      const commitment = getEventCommitment(postId);

      if (commitment?.status === 'confirmado') {
        cancelAgendaCommitment({
          ownerUserId: currentOwnerId,
          commitmentId: commitment.id,
        });
        Alert.alert('Presença cancelada', 'A vaga foi liberada e sua agenda foi atualizada.');
        refresh();
        return;
      }

      const result = addRitualToAgenda({
        ownerUserId: currentOwnerId,
        eventId: postId,
        userProfile,
      });

      if (result?.status === 'lista_espera') {
        Alert.alert('Entrou na lista de espera', 'Você será avisado se uma vaga for liberada.');
      } else {
        Alert.alert('Presença confirmada', 'Este encontro agora está na sua agenda.');
      }

      refresh();
    } catch (error) {
      Alert.alert('Não foi possível confirmar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const handleApplyGig = (postId) => {
    try {
      addGigToAgenda({
        ownerUserId: currentOwnerId,
        postId,
      });

      Alert.alert('Candidatura registrada', 'Você receberá novidades por aqui.');
      refresh();
    } catch (error) {
      Alert.alert('Não foi possível candidatar', error?.message || 'Tente novamente em instantes.');
    }
  };

  const openSharedOrigin = (originId) => {
    const sourcePost = getPostById(originId);
    if (!sourcePost) return;
    onPostClick?.(sourcePost);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            height: headerVisibilityAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 74],
            }),
            opacity: headerVisibilityAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onOpenMenu} style={styles.headerIconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="menu-outline" size={28} color={THEME.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>O CAOS</Text>

          <View style={styles.userMetaWrap}>
            <Text style={styles.userMetaName}>{currentUserName || 'Viajante do Caos'}</Text>
            <Text style={styles.userMetaHandle}>{currentUserHandle || '@viajante_01'}</Text>
          </View>

          <TouchableOpacity style={styles.headerIconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="search-outline" size={24} color={THEME.colors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        style={styles.feedList}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleFeedScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const eventCommitment = item.type === 'event' ? getEventCommitment(item.id) : null;

          return (
            <PressScale style={styles.postCardPressable} onPress={() => handleCardPress(item)}>
              <PostCard
                data={item}
                userProfile={userProfile}
                likedByCurrentUser={isLikedByCurrentUser(item)}
                onToggleLike={handleToggleLike}
                onShare={openShareComposer}
                onOpenSharedOrigin={openSharedOrigin}
                onMorePress={openMenuById}
                onApplyGig={handleApplyGig}
                onConfirmEvent={handleConfirmEvent}
                eventPresenceConfirmed={eventCommitment?.status === 'confirmado'}
                eventWaitlisted={eventCommitment?.status === 'lista_espera'}
              />
            </PressScale>
          );
        }}
      />

      <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={onOpenComposer}>
        <Ionicons name="pencil" size={24} color="#000" />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={Boolean(menuPost)} onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <Pressable style={styles.menuSheet} onPress={() => {}}>
            <Text style={styles.menuTitle}>Ações do post</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => openShareComposer(menuPost)}>
              <Ionicons name="repeat-outline" size={18} color="#EAEAEA" />
              <Text style={styles.menuItemText}>Repostar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleShareNative(menuPost)}>
              <Ionicons name="share-social-outline" size={18} color="#EAEAEA" />
              <Text style={styles.menuItemText}>Compartilhar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleCopyLink(menuPost)}>
              <Ionicons name="link-outline" size={18} color="#EAEAEA" />
              <Text style={styles.menuItemText}>Copiar link</Text>
            </TouchableOpacity>

            {menuPost?.ownerUserId === currentOwnerId ? (
              <TouchableOpacity style={styles.menuItem} onPress={() => openEditModal(menuPost)}>
                <Ionicons name="create-outline" size={18} color="#EAEAEA" />
                <Text style={styles.menuItemText}>Editar post</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.menuItem} onPress={() => handleHidePost(menuPost)}>
              <Ionicons name="eye-off-outline" size={18} color="#EAEAEA" />
              <Text style={styles.menuItemText}>Ocultar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleReportPost(menuPost)}>
              <Ionicons name="flag-outline" size={18} color={THEME.colors.error} />
              <Text style={[styles.menuItemText, { color: THEME.colors.error }]}>Reportar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={showShareComposer}
        onRequestClose={closeShareComposer}
      >
        <View style={styles.shareOverlay}>
          <View style={styles.shareCard}>
            <Text style={styles.shareTitle}>Repostar no feed</Text>
            <Text style={styles.shareSubtitle}>Adicione um comentário opcional.</Text>

            <ScrollView style={styles.sharePreview}>
              <Text style={styles.sharePreviewAuthor}>{shareTargetPost?.author}</Text>
              <Text style={styles.sharePreviewContent}>{shareTargetPost?.text}</Text>
            </ScrollView>

            <TextInput
              value={shareComment}
              onChangeText={setShareComment}
              placeholder="Escreva algo sobre este post"
              placeholderTextColor="#8A8A8A"
              multiline
              style={styles.shareInput}
            />

            <View style={styles.shareActions}>
              <Button title="Cancelar" type="secondary" onPress={closeShareComposer} />
              <Button title="Repostar" type="primary" onPress={submitShareComposer} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={Boolean(editPost)} onRequestClose={closeEditModal}>
        <View style={styles.shareOverlay}>
          <View style={styles.shareCard}>
            <Text style={styles.shareTitle}>Editar post</Text>
            <Text style={styles.shareSubtitle}>Atualize o título e o texto.</Text>

            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título (opcional)"
              placeholderTextColor="#8A8A8A"
              style={[styles.shareInput, styles.editTitleInput]}
            />

            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              style={styles.shareInput}
            />

            <View style={styles.shareActions}>
              <Button title="Cancelar" type="secondary" onPress={closeEditModal} />
              <Button title="Salvar" type="primary" onPress={submitEditPost} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerWrapper: {
    overflow: 'hidden',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
    color: THEME.colors.primary,
    letterSpacing: 1.5,
    marginHorizontal: 8,
  },
  userMetaWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
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
  feedList: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: 16,
  },
  postCardPressable: {
    marginBottom: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 14,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 6,
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  menuTitle: {
    color: '#EFEFEF',
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#E2E2E2',
    fontSize: 15,
    fontFamily: 'Lato_400Regular',
  },
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  shareCard: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  shareTitle: {
    color: '#F0F0F0',
    fontSize: 18,
    fontFamily: 'Lato_700Bold',
  },
  shareSubtitle: {
    color: '#A8A8A8',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Lato_400Regular',
  },
  sharePreview: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#0D0D0D',
  },
  sharePreviewAuthor: {
    color: '#F0F0F0',
    fontSize: 14,
    fontFamily: 'Lato_700Bold',
    marginBottom: 6,
  },
  sharePreviewContent: {
    color: '#BDBDBD',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Lato_400Regular',
  },
  shareInput: {
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F0F0F0',
    textAlignVertical: 'top',
    minHeight: 100,
    fontFamily: 'Lato_400Regular',
  },
  editTitleInput: {
    minHeight: 52,
  },
  shareActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
