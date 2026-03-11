import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

const INITIAL_COMMUNITIES = [
  {
    id: 'c1',
    name: 'Sussurros da Noite',
    type: 'Banda',
    privacy: 'Fechada',
    members: 5,
    openGigs: 2,
    focus: 'Jazz Noir',
  },
  {
    id: 'c2',
    name: 'Guilda dos Session',
    type: 'Coletivo',
    privacy: 'Privada',
    members: 18,
    openGigs: 4,
    focus: 'Substituições e freelas urgentes',
  },
];

const FEED_POSTS = [
  {
    id: 'p1',
    communityId: 'c1',
    kind: 'urgente',
    author: 'Noir Admin',
    text: 'Preciso de tecladista substituto para sexta no Porão do Jazz. Cachê R$350.',
    time: 'há 20min',
  },
  {
    id: 'p2',
    communityId: 'c1',
    kind: 'equip',
    author: 'Batera R.',
    text: 'Vendendo case rígido para prato 20” em ótimo estado.',
    time: 'há 3h',
  },
  {
    id: 'p3',
    communityId: 'c2',
    kind: 'network',
    author: 'Guilda Bot',
    text: '3 casas abriram chamadas em raio de 25km para pop/rock hoje.',
    time: 'há 1h',
  },
];

export default function ArtistHub({ onBack }) {
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [selectedCommunityId, setSelectedCommunityId] = useState(INITIAL_COMMUNITIES[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formFocus, setFormFocus] = useState('');
  const [formType, setFormType] = useState('Banda');
  const [formPrivacy, setFormPrivacy] = useState('Fechada');

  const selectedCommunity = communities.find((item) => item.id === selectedCommunityId);

  const communityPosts = useMemo(
    () => FEED_POSTS.filter((post) => post.communityId === selectedCommunityId),
    [selectedCommunityId]
  );

  const handleCreateCommunity = () => {
    if (!formName.trim()) {
      alert('Nome da comunidade é obrigatório.');
      return;
    }

    const newCommunity = {
      id: Date.now().toString(),
      name: formName.trim(),
      type: formType,
      privacy: formPrivacy,
      members: 1,
      openGigs: 0,
      focus: formFocus.trim() || 'Sem foco definido',
    };

    setCommunities((prev) => [newCommunity, ...prev]);
    setSelectedCommunityId(newCommunity.id);
    setFormName('');
    setFormFocus('');
    setFormType('Banda');
    setFormPrivacy('Fechada');
    setIsCreating(false);
    alert('Comunidade criada com sucesso.');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Taverna dos Bardos</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Comunidade fechada para bandas e coletivos profissionais.</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suas Comunidades</Text>
          <TouchableOpacity style={styles.inlineBtn} onPress={() => setIsCreating((prev) => !prev)}>
            <Ionicons name={isCreating ? 'close' : 'add'} size={16} color="#000" />
            <Text style={styles.inlineBtnText}>{isCreating ? 'Cancelar' : 'Criar Comunidade'}</Text>
          </TouchableOpacity>
        </View>

        {isCreating && (
          <View style={styles.createCard}>
            <Text style={styles.label}>Nome da Comunidade</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="Ex: Irmandade do Groove"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <Text style={styles.label}>Foco</Text>
            <TextInput
              value={formFocus}
              onChangeText={setFormFocus}
              placeholder="Ex: Substituição de músicos para gigs"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.rowChips}>
              {['Banda', 'Coletivo'].map((item) => {
                const active = formType === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFormType(item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Privacidade</Text>
            <View style={styles.rowChips}>
              {['Fechada', 'Privada'].map((item) => {
                const active = formPrivacy === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFormPrivacy(item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateCommunity}>
              <Text style={styles.createButtonText}>Fundar Comunidade</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.communityRow}>
          {communities.map((community) => {
            const selected = selectedCommunityId === community.id;
            return (
              <TouchableOpacity
                key={community.id}
                style={[styles.communityCard, selected && styles.communityCardSelected]}
                onPress={() => setSelectedCommunityId(community.id)}
              >
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityMeta}>{community.type} • {community.privacy}</Text>
                <Text style={styles.communityMeta}>{community.members} membros • {community.openGigs} chamados</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedCommunity && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedCommunity.name}</Text>
            <Text style={styles.detailSubtitle}>Foco: {selectedCommunity.focus}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => alert('Abrindo mural da comunidade...')}>
                <Text style={styles.secondaryActionText}>Mural</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={() => alert('Abrindo lista de membros...')}>
                <Text style={styles.secondaryActionText}>Membros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryAction} onPress={() => alert('Convite enviado para novo integrante.') }>
                <Text style={styles.primaryActionText}>Convidar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Mural da Comunidade</Text>
        {communityPosts.length === 0 ? (
          <Text style={styles.empty}>Sem publicações para esta comunidade.</Text>
        ) : (
          communityPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postTop}>
                <Text style={styles.postType}>{post.kind.toUpperCase()}</Text>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postText}>{post.text}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, padding: 20, paddingTop: 50 },
  content: { paddingBottom: 40 },
  back: { marginBottom: 10 },
  title: { fontFamily: 'Cinzel_700Bold', color: THEME.colors.primary, fontSize: 24 },
  subtitle: { fontFamily: 'Lato_400Regular', color: '#AAA', marginTop: 8, marginBottom: 18 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: '#EEE',
    fontSize: 16,
    marginBottom: 8,
  },
  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlineBtnText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    marginLeft: 4,
    fontSize: 12,
  },
  createCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#141414',
    padding: 12,
    marginBottom: 14,
  },
  label: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    marginBottom: 6,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: '#EEE',
    fontFamily: 'Lato_400Regular',
    backgroundColor: '#1C1C1C',
    marginBottom: 10,
  },
  rowChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#000',
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  createButtonText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
  },
  communityRow: {
    paddingBottom: 4,
  },
  communityCard: {
    width: 220,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    padding: 12,
    marginRight: 10,
  },
  communityCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(255, 200, 0, 0.05)',
  },
  communityName: {
    fontFamily: 'Cinzel_700Bold',
    color: THEME.colors.primary,
    fontSize: 15,
    marginBottom: 4,
  },
  communityMeta: {
    color: '#AAA',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
  },
  detailCard: {
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#161616',
    padding: 12,
  },
  detailTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: THEME.colors.primary,
    fontSize: 18,
  },
  detailSubtitle: {
    fontFamily: 'Lato_400Regular',
    color: '#BBB',
    marginTop: 4,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  primaryActionText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  postCard: {
    borderWidth: 1,
    borderColor: '#2f2f2f',
    borderRadius: 10,
    backgroundColor: '#121212',
    padding: 12,
    marginBottom: 10,
  },
  postTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  postType: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  postTime: {
    color: '#666',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
  },
  postAuthor: {
    color: '#EEE',
    fontFamily: 'Lato_700Bold',
    marginBottom: 4,
  },
  postText: {
    color: '#BBB',
    fontFamily: 'Lato_400Regular',
    lineHeight: 18,
  },
  empty: {
    color: '#666',
    fontFamily: 'Lato_400Regular',
    marginBottom: 8,
  },
});