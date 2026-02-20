import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, Image, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import ProfileAvatar from '../components/ProfileAvatar';

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

export default function PostDetails({ post, onBack }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(INITIAL_COMMENTS);

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

  if (!post) return null;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.type}>{(post.type || 'post').toUpperCase()}</Text>
        <View style={styles.authorRow}>
          <ProfileAvatar
            uri={post.authorAvatarUrl}
            name={post.author}
            variant={post.authorAvatarFallbackStyle || 'sigil'}
            size={36}
            borderWidth={1}
            borderColor="#2F2F2F"
          />
          <View style={styles.authorInfo}>
            <Text style={styles.title}>{post.title || post.author}</Text>
            <Text style={styles.meta}>{post.handle} • {post.time}</Text>
          </View>
        </View>
        {!!post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.text}>{post.text}</Text>
      </View>

      {post.allowComments ? (
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
});