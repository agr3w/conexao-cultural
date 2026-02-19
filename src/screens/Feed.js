import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import PostCard from '../components/PostCard';
import { createBandPost, getVisibleFeedPosts } from '../service/feedPosts';
import { listArtistProfilesByOwner } from '../service/artistProfiles';

export default function Feed({
  onOpenMenu,
  onPostClick,
  userProfile = 'viewer',
  onBandPostCreated,
  refreshTick = 0,
  ownerUserId = 'u_artist_1',
  artistProfileId,
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [audience, setAudience] = useState('public');

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

  const handlePublishBandPost = () => {
    try {
      createBandPost({
        artistProfileId: selectedArtistProfileId,
        title: newTitle,
        text: newText,
        audience,
      });

      setNewTitle('');
      setNewText('');
      setAudience('public');
      setComposerOpen(false);
      onBandPostCreated?.();
      alert(audience === 'community' ? 'Post enviado só para a comunidade VIP.' : 'Post publicado para todos.');
    } catch (error) {
      alert(error?.message || 'Não foi possível publicar agora.');
    }
  };

  const handleOpenComposer = () => {
    if (artistProfiles.length === 0) {
      alert('Cadastre um perfil de banda no setup antes de publicar.');
      return;
    }
    setComposerOpen(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER FIXO (Topo) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenMenu}>
          <Ionicons name="menu-outline" size={28} color={THEME.colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>O CAOS</Text>

        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* LISTA DE POSTS */}
      <FlatList
        data={visiblePosts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onPostClick(item)}>
            <PostCard data={item} userProfile={userProfile} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }} // Espaço para o botão flutuante
      />

      {/* FAB (Floating Action Button) - Botão de Postar */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenComposer}>
        <Ionicons name="pencil" size={24} color={THEME.colors.textDark} />
      </TouchableOpacity>

      <Modal visible={composerOpen} transparent animationType="fade" onRequestClose={() => setComposerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Publicar para fãs</Text>

            <View style={styles.profileRow}>
              <TouchableOpacity
                style={[styles.profileChip, audience === 'public' && styles.profileChipActive]}
                onPress={() => setAudience('public')}
              >
                <Text style={[styles.profileChipText, audience === 'public' && styles.profileChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileChip, audience === 'community' && styles.profileChipActive]}
                onPress={() => setAudience('community')}
              >
                <Text style={[styles.profileChipText, audience === 'community' && styles.profileChipTextActive]}>
                  Só Comunidade
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Título (opcional)"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="Conte a novidade da banda..."
              placeholderTextColor="#666"
              style={[styles.input, styles.inputTextArea]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setComposerOpen(false)}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handlePublishBandPost}>
                <Text style={styles.btnPrimaryText}>Publicar</Text>
              </TouchableOpacity>
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
});