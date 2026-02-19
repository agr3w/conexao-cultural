import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import { createPost } from '../service/feedPosts';
import { listArtistProfilesByOwner } from '../service/artistProfiles';

const POST_TYPES = [
  { id: 'post', label: 'Post', icon: 'create-outline', hint: 'Atualização geral no feed' },
  { id: 'conversation', label: 'Conversa', icon: 'chatbubbles-outline', hint: 'Puxar debate com a galera' },
  { id: 'poll', label: 'Enquete', icon: 'stats-chart-outline', hint: 'Votação com porcentagem' },
  { id: 'event', label: 'Evento', icon: 'calendar-outline', hint: 'Ritual completo com dados' },
  { id: 'gig', label: 'Chamado', icon: 'flash-outline', artistOnly: true, hint: 'Vaga com cachê' },
];

export default function ComposeRitual({
  onBack,
  onPublished,
  userProfile = 'viewer',
  ownerUserId = 'u_artist_1',
  artistProfileId,
  currentUserName = 'Viajante do Caos',
  currentUserHandle = '@viajante_01',
}) {
  const isArtist = userProfile === 'artist';
  const [type, setType] = useState('post');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [audience, setAudience] = useState('public');
  const [cache, setCache] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventSanityLevel, setEventSanityLevel] = useState('3');
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPriceLabel, setEventPriceLabel] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [conversationPrompt, setConversationPrompt] = useState('');

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDraft, setPollDraft] = useState('');
  const [pollOptions, setPollOptions] = useState(['']);

  const artistProfiles = useMemo(() => listArtistProfilesByOwner(ownerUserId), [ownerUserId]);
  const [selectedArtistProfileId, setSelectedArtistProfileId] = useState(
    artistProfileId ?? artistProfiles[0]?.id ?? null
  );

  const availableTypes = POST_TYPES.filter((p) => !p.artistOnly || isArtist);

  const selectedTypeConfig = availableTypes.find((item) => item.id === type);

  const addPollOption = () => {
    const option = pollDraft.trim();
    if (!option) return;
    setPollOptions((prev) => [...prev.filter(Boolean), option]);
    setPollDraft('');
  };

  const removePollOption = (optionIndex) => {
    setPollOptions((prev) => prev.filter((_, index) => index !== optionIndex));
  };

  const publish = () => {
    try {
      createPost({
        userProfile,
        artistProfileId: selectedArtistProfileId,
        author: currentUserName,
        handle: currentUserHandle,
        type,
        title,
        text: type === 'poll' ? pollQuestion : text,
        audience: isArtist ? audience : 'public',
        cache,
        eventDate,
        eventLocation,
        pollOptions,
        sanityLevel: Number(eventSanityLevel),
        isPaid: eventIsPaid,
        priceLabel: eventPriceLabel,
        image: Boolean(imageUrl),
        imageUrl,
        conversationPrompt,
      });

      setTitle('');
      setText('');
      setAudience('public');
      setCache('');
      setEventDate('');
      setEventLocation('');
      setEventSanityLevel('3');
      setEventIsPaid(false);
      setEventPriceLabel('');
      setImageUrl('');
      setConversationPrompt('');
      setPollQuestion('');
      setPollDraft('');
      setPollOptions(['']);

      onPublished?.();
    } catch (e) {
      alert(e?.message || 'Falha ao publicar.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Forja de Ritual</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Forja o tipo de ritual</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {availableTypes.map((item) => {
            const active = type === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.typeCard, active && styles.typeCardActive]}
                onPress={() => setType(item.id)}
              >
                <Ionicons name={item.icon} size={16} color={active ? '#000' : THEME.colors.primary} />
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{item.label}</Text>
                <Text style={[styles.typeHint, active && styles.typeHintActive]}>{item.hint}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview rápido</Text>
          <Text style={styles.previewType}>{selectedTypeConfig?.label || 'Post'}</Text>
          <Text style={styles.previewText}>
            {type === 'poll'
              ? (pollQuestion || 'Pergunta da enquete aparecerá aqui...')
              : type === 'event'
                ? (title || 'Título do evento aparecerá aqui...')
                : (text || 'Seu conteúdo vai aparecer aqui...')}
          </Text>
        </View>

        {isArtist && (
          <>
            <Text style={styles.label}>Alcance</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.scopeBtn, audience === 'public' && styles.scopeBtnActive]}
                onPress={() => setAudience('public')}
              >
                <Text style={[styles.scopeText, audience === 'public' && styles.scopeTextActive]}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scopeBtn, audience === 'community' && styles.scopeBtnActive]}
                onPress={() => setAudience('community')}
              >
                <Text style={[styles.scopeText, audience === 'community' && styles.scopeTextActive]}>Só Comunidade</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {type !== 'poll' && (
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={type === 'event' ? 'Título do Evento' : 'Título (opcional)'}
            placeholderTextColor="#666"
            style={styles.input}
          />
        )}

        {type !== 'poll' && (
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              type === 'conversation'
                ? 'Abra um tema para a galera discutir...'
                : type === 'event'
                  ? 'Descrição completa do evento...'
                  : type === 'gig'
                    ? 'Descreva os detalhes do chamado...'
                    : 'Conte seu chamado ao caos...'
            }
            placeholderTextColor="#666"
            multiline
            style={[styles.input, styles.textArea]}
          />
        )}

        {type === 'poll' && (
          <View style={styles.blockCard}>
            <TextInput
              value={pollQuestion}
              onChangeText={setPollQuestion}
              placeholder="Pergunta da enquete"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <View style={styles.pollAddRow}>
              <TextInput
                value={pollDraft}
                onChangeText={setPollDraft}
                placeholder="Adicionar opção"
                placeholderTextColor="#666"
                style={[styles.input, styles.pollInput]}
              />
              <TouchableOpacity style={styles.addButton} onPress={addPollOption}>
                <Ionicons name="add" size={18} color="#000" />
              </TouchableOpacity>
            </View>

            {pollOptions.filter(Boolean).length > 0 && (
              <View style={styles.pollOptionsWrap}>
                {pollOptions.filter(Boolean).map((option, index) => (
                  <TouchableOpacity key={`${option}_${index}`} style={styles.pollOptionChip} onPress={() => removePollOption(index)}>
                    <Text style={styles.pollOptionChipText}>{option}</Text>
                    <Ionicons name="close" size={14} color="#A0A0A0" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {type === 'gig' && (
          <TextInput
            value={cache}
            onChangeText={setCache}
            placeholder="Cachê (ex: R$ 800 + consumo)"
            placeholderTextColor="#666"
            style={styles.input}
          />
        )}

        {type === 'event' && (
          <View style={styles.blockCard}>
            <TextInput
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="Data/Hora (ex: Sexta 22:00)"
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

            <Text style={styles.metaLabel}>Nível de Sanidade</Text>
            <View style={styles.sanityRow}>
              {[1, 2, 3, 4, 5].map((level) => {
                const selected = Number(eventSanityLevel) === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.sanityChip, selected && styles.sanityChipActive]}
                    onPress={() => setEventSanityLevel(String(level))}
                  >
                    <Text style={[styles.sanityChipText, selected && styles.sanityChipTextActive]}>{level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.metaLabel}>Evento com tributo?</Text>
              <TouchableOpacity
                style={[styles.scopeBtn, eventIsPaid && styles.scopeBtnActive]}
                onPress={() => setEventIsPaid((prev) => !prev)}
              >
                <Text style={[styles.scopeText, eventIsPaid && styles.scopeTextActive]}>
                  {eventIsPaid ? 'Sim' : 'Não'}
                </Text>
              </TouchableOpacity>
            </View>

            {eventIsPaid && (
              <TextInput
                value={eventPriceLabel}
                onChangeText={setEventPriceLabel}
                placeholder="Valor / etiqueta de ingresso (ex: R$ 30,00)"
                placeholderTextColor="#666"
                style={styles.input}
              />
            )}
          </View>
        )}

        {(type === 'post' || type === 'conversation' || type === 'event') && (
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Imagem (URL opcional)"
            placeholderTextColor="#666"
            style={styles.input}
          />
        )}

        {type === 'conversation' && (
          <TextInput
            value={conversationPrompt}
            onChangeText={setConversationPrompt}
            placeholder="Pergunta disparadora (opcional)"
            placeholderTextColor="#666"
            style={styles.input}
          />
        )}

        <View style={{ marginTop: 8 }}>
          <Button title="Publicar Ritual" type="primary" onPress={publish} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, paddingTop: 48 },
  top: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { color: THEME.colors.primary, fontFamily: 'Cinzel_700Bold', fontSize: 22 },
  content: { padding: 16, paddingBottom: 32 },
  label: { color: '#AAA', fontFamily: 'Lato_700Bold', marginBottom: 8, marginTop: 8 },
  typeRow: { paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeCard: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    minWidth: 118,
  },
  typeCardActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  typeText: { color: '#DDD', fontFamily: 'Lato_700Bold', fontSize: 12 },
  typeTextActive: { color: '#000' },
  typeHint: { color: '#8A8A8A', fontFamily: 'Lato_400Regular', fontSize: 10, marginTop: 4 },
  typeHintActive: { color: '#111' },
  previewCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    backgroundColor: '#151515',
    padding: 12,
    marginBottom: 12,
  },
  previewTitle: {
    color: '#777',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    marginBottom: 4,
  },
  previewType: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 14,
  },
  previewText: {
    marginTop: 4,
    color: '#C8C8C8',
    fontFamily: 'Lato_400Regular',
    lineHeight: 18,
  },
  scopeBtn: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scopeBtnActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  scopeText: { color: '#DDD', fontFamily: 'Lato_700Bold' },
  scopeTextActive: { color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#121212',
    color: '#EEE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontFamily: 'Lato_400Regular',
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  blockCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    backgroundColor: '#151515',
    padding: 10,
    marginBottom: 10,
  },
  pollAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pollInput: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  pollOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: '#111',
  },
  pollOptionChipText: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  metaLabel: {
    color: '#AAA',
    fontFamily: 'Lato_700Bold',
    marginBottom: 8,
  },
  sanityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sanityChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sanityChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  sanityChipText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
  },
  sanityChipTextActive: {
    color: '#000',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});