import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import ImageActionButtons from '../components/ImageActionButtons';
import { createPost } from '../service/feedPosts';
import { listArtistProfilesByOwner } from '../service/artistProfiles';
import { pickImageFromCamera, pickImageFromLibrary } from '../service/mediaPicker';

const POST_TYPES = [
  { id: 'post', label: 'Post', icon: 'create-outline', hint: 'Atualização geral no feed' },
  { id: 'conversation', label: 'Conversa', icon: 'chatbubbles-outline', hint: 'Puxar debate com a galera' },
  { id: 'poll', label: 'Enquete', icon: 'stats-chart-outline', hint: 'Votação com porcentagem' },
  { id: 'event', label: 'Evento', icon: 'calendar-outline', hint: 'Ritual completo com dados' },
  { id: 'gig', label: 'Chamado', icon: 'flash-outline', artistOnly: true, hint: 'Vaga com cachê' },
];

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

export default function ComposeRitual({
  onBack,
  onPublished,
  userProfile = 'viewer',
  ownerUserId = 'u_artist_1',
  artistProfileId,
  currentUserName = 'Viajante do Caos',
  currentUserHandle = '@viajante_01',
  currentUserAvatarUrl = '',
  currentUserAvatarFallbackStyle = 'sigil',
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
  const [imagePreviewError, setImagePreviewError] = useState(false);
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

  const publish = () => {
    try {
      createPost({
        userProfile,
        ownerUserId,
        artistProfileId: selectedArtistProfileId,
        author: currentUserName,
        handle: currentUserHandle,
        authorAvatarUrl: currentUserAvatarUrl,
        authorAvatarFallbackStyle: currentUserAvatarFallbackStyle,
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
      setImagePreviewError(false);
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
        <PressScale onPress={onBack} style={styles.topBackWrap}>
          <View style={styles.topBackButton}>
            <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
          </View>
        </PressScale>
        <Text style={styles.title}>Forja de Ritual</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Forja o tipo de ritual</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {availableTypes.map((item) => {
            const active = type === item.id;
            return (
              <PressScale
                key={item.id}
                style={styles.typeCardWrap}
                onPress={() => setType(item.id)}
              >
                <View style={[styles.typeCard, active && styles.typeCardActive]}>
                  <Ionicons name={item.icon} size={16} color={active ? '#000' : THEME.colors.primary} />
                  <Text style={[styles.typeText, active && styles.typeTextActive]}>{item.label}</Text>
                  <Text style={[styles.typeHint, active && styles.typeHintActive]}>{item.hint}</Text>
                </View>
              </PressScale>
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
              <PressScale
                style={styles.scopeBtnWrap}
                onPress={() => setAudience('public')}
              >
                <View style={[styles.scopeBtn, audience === 'public' && styles.scopeBtnActive]}>
                  <Text style={[styles.scopeText, audience === 'public' && styles.scopeTextActive]}>Todos</Text>
                </View>
              </PressScale>
              <PressScale
                style={styles.scopeBtnWrap}
                onPress={() => setAudience('community')}
              >
                <View style={[styles.scopeBtn, audience === 'community' && styles.scopeBtnActive]}>
                  <Text style={[styles.scopeText, audience === 'community' && styles.scopeTextActive]}>Só Comunidade</Text>
                </View>
              </PressScale>
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
              <PressScale style={styles.addButtonWrap} onPress={addPollOption}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={18} color="#000" />
                </View>
              </PressScale>
            </View>

            {pollOptions.filter(Boolean).length > 0 && (
              <View style={styles.pollOptionsWrap}>
                {pollOptions.filter(Boolean).map((option, index) => (
                  <PressScale key={`${option}_${index}`} style={styles.pollOptionChipWrap} onPress={() => removePollOption(index)}>
                    <View style={styles.pollOptionChip}>
                      <Text style={styles.pollOptionChipText}>{option}</Text>
                      <Ionicons name="close" size={14} color="#A0A0A0" />
                    </View>
                  </PressScale>
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
                  <PressScale
                    key={level}
                    style={styles.sanityChipWrap}
                    onPress={() => setEventSanityLevel(String(level))}
                  >
                    <View style={[styles.sanityChip, selected && styles.sanityChipActive]}>
                      <Text style={[styles.sanityChipText, selected && styles.sanityChipTextActive]}>{level}</Text>
                    </View>
                  </PressScale>
                );
              })}
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.metaLabel}>Evento com tributo?</Text>
              <PressScale
                style={styles.scopeBtnWrap}
                onPress={() => setEventIsPaid((prev) => !prev)}
              >
                <View style={[styles.scopeBtn, eventIsPaid && styles.scopeBtnActive]}>
                  <Text style={[styles.scopeText, eventIsPaid && styles.scopeTextActive]}>
                    {eventIsPaid ? 'Sim' : 'Não'}
                  </Text>
                </View>
              </PressScale>
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
                    <Ionicons name="alert-circle-outline" size={20} color="#D29A1D" />
                    <Text style={styles.imagePreviewFallbackText}>Não foi possível carregar a imagem.</Text>
                  </View>
                )}
              </View>
            )}
          </>
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
  topBackWrap: {
    borderRadius: 16,
  },
  topBackButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: THEME.colors.primary, fontFamily: 'Cinzel_700Bold', fontSize: 22 },
  content: { padding: 16, paddingBottom: 32 },
  label: { color: '#AAA', fontFamily: 'Lato_700Bold', marginBottom: 8, marginTop: 8 },
  typeRow: { paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeCardWrap: {
    borderRadius: 14,
    marginRight: 8,
  },
  typeCard: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  scopeBtnWrap: {
    borderRadius: 12,
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
  addButtonWrap: {
    borderRadius: 18,
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
  pollOptionChipWrap: {
    borderRadius: 16,
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
  sanityChipWrap: {
    borderRadius: 10,
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
  imagePreviewCard: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    backgroundColor: '#111',
    overflow: 'hidden',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  imagePreviewFallback: {
    height: 92,
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
});