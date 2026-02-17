import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

export default function PostDetails({ post, onBack }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [{ id: Date.now().toString(), author: 'Você', text: comment.trim() }, ...prev]);
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
        <Text style={styles.title}>{post.title || post.author}</Text>
        <Text style={styles.meta}>{post.handle} • {post.time}</Text>
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
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{item.author}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            )}
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
  title: { color: THEME.colors.primary, fontFamily: 'Cinzel_700Bold', fontSize: 24, marginTop: 4 },
  meta: { color: '#777', marginTop: 4, marginBottom: 12 },
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
  commentItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  commentAuthor: { color: THEME.colors.primary, fontFamily: 'Lato_700Bold' },
  commentText: { color: '#DDD', marginTop: 2 },
  empty: { color: '#666', marginTop: 8 },
  blocked: { color: '#777', fontStyle: 'italic' },
});