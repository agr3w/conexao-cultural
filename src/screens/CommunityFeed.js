import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { getCommunityById, getCommunityFeedById } from '../service/fanCommunities';
import ProfileAvatar from '../components/ProfileAvatar';

export default function CommunityFeed({ communityId, onBack }) {
  const community = getCommunityById(communityId);
  const posts = getCommunityFeedById(communityId);

  if (!community) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Comunidade não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
      </TouchableOpacity>

      <Text style={styles.title}>{community.title}</Text>
      <Text style={styles.subtitle}>{community.description}</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.badge}>{(item.type || 'post').toUpperCase()}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.author && (
              <View style={styles.authorRow}>
                <ProfileAvatar
                  uri={item.authorAvatarUrl}
                  name={item.author}
                  variant={item.authorAvatarFallbackStyle || 'sigil'}
                  size={24}
                  borderWidth={1}
                  borderColor="#2F2F2F"
                />
                <Text style={styles.author}>por {item.author}</Text>
              </View>
            )}
            <Text style={styles.cardText}>{item.text}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, padding: 20, paddingTop: 50 },
  back: { marginBottom: 8 },
  title: { fontFamily: 'Cinzel_700Bold', color: THEME.colors.primary, fontSize: 24 },
  subtitle: { color: '#AAA', fontFamily: 'Lato_400Regular', marginTop: 6, marginBottom: 16 },
  card: {
    borderWidth: 1, borderColor: '#333', borderRadius: 10, backgroundColor: '#161616',
    padding: 12, marginBottom: 10,
  },
  badge: { color: THEME.colors.primary, fontFamily: 'Lato_700Bold', fontSize: 10, marginBottom: 6 },
  cardTitle: { color: '#EEE', fontFamily: 'Lato_700Bold', marginBottom: 4 },
  cardText: { color: '#BBB', fontFamily: 'Lato_400Regular' },
  time: { color: '#666', fontFamily: 'Lato_400Regular', fontSize: 12, marginTop: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  author: { color: '#888', fontFamily: 'Lato_400Regular', fontSize: 12, marginLeft: 8 },
});