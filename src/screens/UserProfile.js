import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors';
import { getViewerProfileById } from '../service/viewerProfiles';
import ProfileAvatar from '../components/ProfileAvatar';
import { getPostsByAuthorHandle } from '../service/feedPosts';

const { width } = Dimensions.get('window');

// Altura compacta da barra superior
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 44;
const HEADER_HEIGHT = TOP_INSET + 48;

function toUserViewModel(profile) {
  return {
    name: profile?.name || 'Viajante do Caos',
    handle: profile?.handle || '@viajante_01',
    title: profile?.city || 'Sem base definida',
    bio: profile?.bio || 'Sem bio cadastrada.',
    level: 1,
    xp: 20,
    avatar: profile?.avatarUrl || '',
    avatarFallbackStyle: profile?.avatarFallbackStyle || 'sigil',
    stats: {
      events: 0,
      following: 0,
      followers: 0,
    },
    badges: [],
    memories: [],
  };
}

export default function UserProfile({ onBack, onEditProfile, viewerProfileId, ownerUserId, refreshTick = 0 }) {
  const profile = viewerProfileId ? getViewerProfileById(viewerProfileId) : null;
  const USER = toUserViewModel(profile);

  const userPosts = useMemo(
    () => getPostsByAuthorHandle(USER.handle, { includeCommunity: true, limit: 20 }),
    [USER.handle, refreshTick]
  );

  return (
    <View style={styles.container}>
      {/* 1. CABEÇALHO COM DEGRADÊ */}
      <LinearGradient
        colors={[THEME.colors.primary, '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerBackground}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Ionicons name="settings-outline" size={22} color="#000" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. AVATAR E INFO (O Retrato) */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <ProfileAvatar
              uri={USER.avatar}
              name={USER.name}
              variant={USER.avatarFallbackStyle}
              size={120}
              borderWidth={4}
              borderColor={THEME.colors.background}
              style={styles.avatar}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{USER.level}</Text>
            </View>
          </View>

          <Text style={styles.name}>{USER.name}</Text>
          <Text style={styles.title}>{USER.title}</Text>
          <Text style={styles.handleText}>{USER.handle}</Text>
          <Text style={styles.bioText}>{USER.bio}</Text>

          {/* Barra de XP */}
          <View style={styles.xpContainer}>
            <View style={[styles.xpBar, { width: `${USER.xp}%` }]} />
          </View>
          <Text style={styles.xpText}>{USER.xp}% para o Nível {USER.level + 1}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.events}</Text>
              <Text style={styles.statLabel}>Rituais</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.following}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.followers}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
          </View>
        </View>

        {/* 3. INSÍGNIAS (Badges) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conquistas Desbloqueadas</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
            {USER.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  <Ionicons name={badge.icon} size={24} color="#FFF" />
                </View>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 4. ATIVIDADE (Padrão unificado) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publicações no Caos</Text>
          {userPosts.length ? userPosts.map((post) => (
            <View key={`user_post_${post.id}`} style={styles.memoryCard}>
              {!!post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.memoryImage} />
              ) : (
                <View style={styles.likedFallback}>
                  <Ionicons name="create-outline" size={22} color={THEME.colors.primary} />
                </View>
              )}
              <View style={styles.memoryInfo}>
                <Text style={styles.memoryTitle}>{post.title || post.author}</Text>
                <Text style={styles.memoryDate}>
                  <Ionicons name="time-outline" size={12} color="#888" /> {post.time || 'agora'} • {String(post.type || 'post').toUpperCase()}
                </Text>
                <Text style={styles.memorySnippet} numberOfLines={2}>{post.text || 'Sem descrição.'}</Text>
                <Text style={styles.postMetaText}>{post.likes || 0} chamas • {post.comments || 0} comentários</Text>
              </View>
            </View>
          )) : (
            <Text style={styles.emptyLikedText}>Você ainda não publicou no feed.</Text>
          )}

          <Text style={styles.sectionTitle}>Fragmentos de Memória</Text>
          {USER.memories.map((memory) => (
            <View key={memory.id} style={styles.memoryCard}>
              <Image source={{ uri: memory.image }} style={styles.memoryImage} />
              <View style={styles.memoryInfo}>
                <Text style={styles.memoryTitle}>{memory.event}</Text>
                <Text style={styles.memoryDate}>
                  <Ionicons name="calendar-outline" size={12} color="#888" /> {memory.date}
                </Text>
                <View style={styles.ticketStub}>
                  <Text style={styles.ticketText}>TICKET #{memory.id}</Text>
                </View>
              </View>
            </View>
          ))}
          {!USER.memories.length && (
            <Text style={styles.emptyLikedText}>Nenhum fragmento registrado ainda.</Text>
          )}
        </View>

        <View style={{ height: 40 }} />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerBackground: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: TOP_INSET + 6,
    left: 16,
    backgroundColor: 'rgba(255,200,0,0.8)', // Amarelo translúcido
    borderRadius: 16,
    padding: 6,
  },
  editButton: {
    position: 'absolute',
    top: TOP_INSET + 8,
    right: 16,
    backgroundColor: 'rgba(255,200,0,0.85)',
    borderRadius: 14,
    padding: 6,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT - 20, // menor espaço no topo
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    zIndex: 2,
  },
  avatar: {
    backgroundColor: '#111',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: THEME.colors.primary, // Amarelo
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: THEME.colors.background,
  },
  levelText: {
    fontFamily: 'Cinzel_700Bold', //
    color: '#000',
    fontSize: 16,
  },
  name: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 26,
    color: THEME.colors.text,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Lato_400Regular', //
    color: THEME.colors.primary,
    fontSize: 14,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  handleText: {
    color: '#888',
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    marginBottom: 6,
  },
  bioText: {
    color: '#AAA',
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  xpContainer: {
    width: 200,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  xpBar: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  xpText: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'Lato_400Regular',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#222',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Cinzel_700Bold',
    color: '#FFF',
    fontSize: 20,
  },
  statLabel: {
    fontFamily: 'Lato_400Regular',
    color: '#888',
    fontSize: 12,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: THEME.colors.primary,
    fontSize: 18,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    paddingLeft: 10,
  },
  // Badges
  badgesScroll: {
    paddingBottom: 10,
  },
  badgeCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeName: {
    color: '#CCC',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Lato_700Bold',
  },
  // Memories
  memoryCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  memoryImage: {
    width: 100,
    height: '100%',
  },
  memoryInfo: {
    padding: 12,
    flex: 1,
  },
  likedFallback: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  memoryTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: '#FFF',
    fontSize: 16,
    marginBottom: 4,
  },
  memoryDate: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
    fontFamily: 'Lato_400Regular',
  },
  memorySnippet: {
    color: '#B5B5B5',
    fontSize: 12,
    fontFamily: 'Lato_400Regular',
    lineHeight: 16,
  },
  emptyLikedText: {
    color: '#888',
    fontFamily: 'Lato_400Regular',
    marginBottom: 14,
  },
  postMetaText: {
    marginTop: 8,
    color: '#8F8F8F',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  ticketStub: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  ticketText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontFamily: 'Lato_700Bold',
    letterSpacing: 1,
  }
});