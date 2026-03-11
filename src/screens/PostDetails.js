import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Animated, Easing, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { THEME } from '../styles/colors';
import ProfileAvatar from '../components/ProfileAvatar';
import {
  getPostById,
  getPostPublicLink,
  hidePostForOwner,
  reportPost,
  sharePost,
  togglePostLike,
  updatePostContent,
} from '../service/feedPosts';

const COMMENTER_VARIANTS = ['sigil', 'neon', 'minimal'];

const INITIAL_COMMENTS = [
  {
    id: 'c_seed_1',
    author: 'Luna',
    handle: '@lua_ritual',
    text: 'Energia absurda nesse post. Curti muito a proposta.',
    avatarUrl: '',
    avatarFallbackStyle: 'neon',
  },
  {
    id: 'c_seed_2',
    author: 'Kadu',
    handle: '@kadu_noise',
    text: 'Já quero ver a continuação disso no próximo ritual 👀',
    avatarUrl: '',
    avatarFallbackStyle: 'sigil',
  },
];

function AnimatedCommentItem({ item, index }) {
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryAnim, {
      toValue: 1,
      duration: 260,
      delay: Math.min(index * 40, 140),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entryAnim, index]);

  return (
    <Animated.View
      style={[
        styles.commentItem,
        {
          opacity: entryAnim,
          transform: [
            {
              translateY: entryAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <ProfileAvatar
        uri={item.avatarUrl}
        name={item.author}
        variant={item.avatarFallbackStyle || 'sigil'}
        size={34}
        borderWidth={1}
        borderColor="#2A2A2A"
      />
      <View style={styles.commentBody}>
        <Text style={styles.commentAuthor}>{item.author}</Text>
        {!!item.handle && <Text style={styles.commentHandle}>{item.handle}</Text>}
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
}

export default function PostDetails({
  post,
  onBack,
  onOpenPost,
  currentUserName = 'Viajante do Caos',
  currentUserHandle = '@viajante_01',
  currentUserAvatarUrl = '',
  currentUserAvatarFallbackStyle = 'sigil',
  likeOwnerUserId = 'u_viewer_1',
  currentUserKind = 'viewer',
  onPostInteraction,
}) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [repostCommentOpen, setRepostCommentOpen] = useState(false);
  const [repostMenuMounted, setRepostMenuMounted] = useState(false);
  const [shareCommentText, setShareCommentText] = useState('');
  const [detailTick, setDetailTick] = useState(0);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const repostAnim = useRef(new Animated.Value(0)).current;

  const currentPost = getPostById(post?.id) || post;

  useEffect(() => {
    if (repostMenuOpen) {
      setRepostMenuMounted(true);
      Animated.timing(repostAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!repostMenuMounted) return;

    Animated.timing(repostAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRepostMenuMounted(false);
    });
  }, [repostMenuOpen, repostMenuMounted, repostAnim]);

  const addComment = () => {
    if (!comment.trim()) return;
    const newId = Date.now().toString();
    const variant = COMMENTER_VARIANTS[newId.charCodeAt(newId.length - 1) % COMMENTER_VARIANTS.length];

    setComments((prev) => [{
      id: newId,
      author: 'Você',
      handle: '@voce',
      text: comment.trim(),
      avatarUrl: '',
      avatarFallbackStyle: variant,
    }, ...prev]);
    setComment('');
  };

  if (!currentPost) return null;

  const likedByCurrentUser = Array.isArray(currentPost?.likedByOwnerUserIds)
    ? currentPost.likedByOwnerUserIds.includes(likeOwnerUserId)
    : false;
  const canEditCurrentPost = currentPost?.ownerUserId === likeOwnerUserId;

  const handleToggleLike = () => {
    try {
      togglePostLike(currentPost.id, likeOwnerUserId);
      setDetailTick((prev) => prev + 1);
      onPostInteraction?.();
    } catch (error) {
      alert(error?.message || 'Não foi possível registrar a curtida.');
    }
  };

  const openOriginalFromShare = () => {
    const originId = currentPost?.sharedPostOrigin?.id;
    if (!originId) return;

    const original = getPostById(originId);
    if (!original) {
      alert('Não foi possível abrir a publicação original.');
      return;
    }

    onOpenPost?.(original);
  };

  const publishShare = (withComment = false) => {
    const safeComment = String(shareCommentText || '').trim();
    if (withComment && safeComment.length < 3) {
      alert('Escreva um comentário com pelo menos 3 caracteres.');
      return;
    }

    try {
      sharePost({
        postId: currentPost.id,
        ownerUserId: likeOwnerUserId,
        author: currentUserName,
        handle: currentUserHandle,
        authorKind: currentUserKind,
        authorAvatarUrl: currentUserAvatarUrl,
        authorAvatarFallbackStyle: currentUserAvatarFallbackStyle,
        comment: withComment ? safeComment : '',
      });

      setRepostMenuOpen(false);
      setRepostCommentOpen(false);
      setShareCommentText('');
      onPostInteraction?.();
      alert(withComment ? 'Compartilhamento com comentário publicado.' : 'Post compartilhado no feed.');
    } catch (error) {
      alert(error?.message || 'Não foi possível compartilhar agora.');
    }
  };

  const openRepostMenu = () => {
    setRepostCommentOpen(false);
    setRepostMenuOpen(true);
  };

  const closeRepostFlow = () => {
    setRepostMenuOpen(false);
    setRepostCommentOpen(false);
    setShareCommentText('');
  };

  const openRepostCommentComposer = () => {
    setRepostMenuOpen(false);
    setRepostCommentOpen(true);
  };

  const openEditPostModal = () => {
    if (!canEditCurrentPost) {
      alert('Você só pode editar posts criados por você.');
      return;
    }

    setEditTitle(currentPost?.title || '');
    setEditText(currentPost?.text || '');
    setPostMenuOpen(false);
    setEditPostModalOpen(true);
  };

  const closeEditPostModal = () => {
    setEditPostModalOpen(false);
    setEditTitle('');
    setEditText('');
  };

  const saveEditedPost = () => {
    try {
      updatePostContent({
        postId: currentPost.id,
        ownerUserId: likeOwnerUserId,
        title: editTitle,
        text: editText,
      });

      setDetailTick((prev) => prev + 1);
      closeEditPostModal();
      onPostInteraction?.();
      alert('Post atualizado com sucesso.');
    } catch (error) {
      alert(error?.message || 'Não foi possível salvar as edições.');
    }
  };

  const copyLink = async () => {
    try {
      const link = getPostPublicLink(currentPost.id);
      await Clipboard.setStringAsync(link);
      setPostMenuOpen(false);
      alert('Link copiado para a área de transferência.');
    } catch (error) {
      alert('Não foi possível copiar o link.');
    }
  };

  const shareExternal = async () => {
    const link = getPostPublicLink(currentPost.id);
    const message = `${currentPost.title || currentPost.author}\n${currentPost.text || ''}\n\n${link}`;

    try {
      await Share.share({ message });
      setPostMenuOpen(false);
    } catch (error) {
      alert('Não foi possível abrir o compartilhamento externo.');
    }
  };

  const sendReport = () => {
    try {
      reportPost(currentPost.id, likeOwnerUserId, 'conteúdo inapropriado');
      setPostMenuOpen(false);
      alert('Denúncia enviada. Obrigado por avisar.');
    } catch (error) {
      alert(error?.message || 'Não foi possível denunciar este post.');
    }
  };

  const hideCurrentPost = () => {
    try {
      hidePostForOwner(currentPost.id, likeOwnerUserId);
      setPostMenuOpen(false);
      onPostInteraction?.();
      alert('Post ocultado do seu feed.');
      onBack?.();
    } catch (error) {
      alert(error?.message || 'Não foi possível ocultar este post.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.type}>{(currentPost.type || 'post').toUpperCase()}</Text>
        <View style={styles.authorRow}>
          <ProfileAvatar
            uri={currentPost.authorAvatarUrl}
            name={currentPost.author}
            variant={currentPost.authorAvatarFallbackStyle || 'sigil'}
            size={36}
            borderWidth={1}
            borderColor="#2F2F2F"
          />
          <View style={styles.authorInfo}>
            <Text style={styles.title}>{currentPost.title || currentPost.author}</Text>
            <Text style={styles.meta}>{currentPost.handle} • {currentPost.time}</Text>
          </View>
          <TouchableOpacity onPress={() => setPostMenuOpen(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {currentPost.type === 'share' && !!currentPost.sharedPostOrigin && (
          <TouchableOpacity style={styles.sharedOriginCard} activeOpacity={0.9} onPress={openOriginalFromShare}>
            <Text style={styles.sharedOriginMeta}>
              Compartilhamento de {currentPost.sharedPostOrigin.author}
            </Text>
            {!!currentPost.sharedPostOrigin.title && (
              <Text style={styles.sharedOriginTitle} numberOfLines={1}>{currentPost.sharedPostOrigin.title}</Text>
            )}
            <Text style={styles.sharedOriginText} numberOfLines={2}>
              {currentPost.sharedPostOrigin.text || 'Sem descrição.'}
            </Text>
          </TouchableOpacity>
        )}

        {!!currentPost.imageUrl && (
          <Image source={{ uri: currentPost.imageUrl }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.text}>{currentPost.text}</Text>

        <View style={styles.actionsRow}>
          {currentPost.allowComments && (
            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={21} color="#888" />
              <Text style={styles.actionText}>{Number(currentPost.comments || 0)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={openRepostMenu}>
            <Ionicons name="share-social-outline" size={21} color="#888" />
            {!!Number(currentPost.shares || 0) && <Text style={styles.actionText}>{Number(currentPost.shares || 0)}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleToggleLike}>
            <Text style={[styles.actionText, { color: THEME.colors.primary, marginRight: 6 }]}>{Number(currentPost.likes || 0)}</Text>
            <Ionicons name={likedByCurrentUser ? 'flame' : 'flame-outline'} size={23} color={THEME.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setPostMenuOpen(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {currentPost.allowComments ? (
        <View style={styles.commentsBox}>
          <Text style={styles.commentsTitle}>Comentários</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Escreva um comentário..."
              placeholderTextColor="#666"
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={addComment}>
              <Ionicons name="send" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => <AnimatedCommentItem item={item} index={index} />}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum comentário ainda.</Text>}
          />
        </View>
      ) : (
        <Text style={styles.blocked}>Comentários desativados pelo autor.</Text>
      )}

      <Modal visible={repostMenuMounted} transparent animationType="none" onRequestClose={closeRepostFlow}>
        <View style={styles.repostModalRoot}>
          <TouchableOpacity style={styles.repostBackdrop} activeOpacity={1} onPress={closeRepostFlow} />

          <Animated.View
            style={[
              styles.repostOverlay,
              {
                opacity: repostAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
            pointerEvents="none"
          />

          <Animated.View
            style={[
              styles.repostSheet,
              {
                opacity: repostAnim,
                transform: [
                  {
                    translateY: repostAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [36, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.repostActionItem} onPress={() => publishShare(false)}>
              <Ionicons name="repeat-outline" size={20} color="#E7E7E7" />
              <Text style={styles.repostActionText}>Repostar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.repostActionItem} onPress={openRepostCommentComposer}>
              <Ionicons name="create-outline" size={20} color="#E7E7E7" />
              <Text style={styles.repostActionText}>Comentário</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.repostActionItem, styles.repostActionCancel]} onPress={closeRepostFlow}>
              <Text style={styles.repostCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={repostCommentOpen} transparent animationType="fade" onRequestClose={closeRepostFlow}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Repost com comentário</Text>
            <TextInput
              value={shareCommentText}
              onChangeText={setShareCommentText}
              placeholder="Escreva seu comentário"
              placeholderTextColor="#666"
              style={styles.input}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeRepostFlow}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => publishShare(true)}>
                <Text style={styles.btnPrimaryText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={postMenuOpen} transparent animationType="fade" onRequestClose={() => setPostMenuOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.postMenuCard}>
            <Text style={styles.postMenuTitle}>Ações do post</Text>

            <TouchableOpacity
              style={[styles.postMenuItem, !canEditCurrentPost && styles.postMenuItemDisabled]}
              onPress={openEditPostModal}
              disabled={!canEditCurrentPost}
            >
              <Ionicons name="create-outline" size={16} color={canEditCurrentPost ? '#D6D6D6' : '#666'} />
              <Text style={[styles.postMenuItemText, !canEditCurrentPost && styles.postMenuItemTextDisabled]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={copyLink}>
              <Ionicons name="copy-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Copiar link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={shareExternal}>
              <Ionicons name="logo-whatsapp" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Compartilhar externo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={sendReport}>
              <Ionicons name="flag-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Denunciar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postMenuItem} onPress={hideCurrentPost}>
              <Ionicons name="eye-off-outline" size={16} color="#D6D6D6" />
              <Text style={styles.postMenuItemText}>Ocultar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.postMenuItem, styles.postMenuClose]} onPress={() => setPostMenuOpen(false)}>
              <Text style={styles.postMenuCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editPostModalOpen} transparent animationType="fade" onRequestClose={closeEditPostModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar publicação</Text>

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
              style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeEditPostModal}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={saveEditedPost}>
                <Text style={styles.btnPrimaryText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, padding: 16 },
  backButton: { marginBottom: 12 },
  content: { marginBottom: 16 },
  type: { color: '#888', fontFamily: 'Lato_700Bold', fontSize: 12 },
  authorRow: {
    marginTop: 4,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  title: { color: THEME.colors.primary, fontFamily: 'Cinzel_700Bold', fontSize: 24, marginTop: 4 },
  meta: { color: '#777', marginTop: 2 },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#111',
  },
  text: { color: THEME.colors.text, fontFamily: 'Lato_400Regular', fontSize: 16, lineHeight: 22 },
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
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#888',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
  },
  commentsBox: { flex: 1, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 12 },
  commentsTitle: { color: '#DDD', fontFamily: 'Lato_700Bold', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: THEME.colors.secondary, color: THEME.colors.text,
    borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10
  },
  sendBtn: {
    marginLeft: 8, backgroundColor: THEME.colors.primary, width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center'
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentBody: {
    marginLeft: 10,
    flex: 1,
  },
  commentAuthor: { color: THEME.colors.primary, fontFamily: 'Lato_700Bold' },
  commentHandle: { color: '#7C7C7C', fontSize: 11, marginTop: 1, fontFamily: 'Lato_400Regular' },
  commentText: { color: '#DDD', marginTop: 3 },
  empty: { color: '#666', marginTop: 8 },
  blocked: { color: '#777', fontStyle: 'italic' },
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
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  modalActions: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  btnGhostText: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  btnPrimary: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
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
  repostModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  repostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  repostBackdrop: {
    ...StyleSheet.absoluteFillObject,
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
});