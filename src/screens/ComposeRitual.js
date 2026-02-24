import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Animated, Modal, Platform } from 'react-native';
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

function formatDateTimeLabel(date) {
  const safeDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(safeDate.getTime())) return '';

  const day = String(safeDate.getDate()).padStart(2, '0');
  const month = String(safeDate.getMonth() + 1).padStart(2, '0');
  const year = String(safeDate.getFullYear());
  const hours = String(safeDate.getHours()).padStart(2, '0');
  const minutes = String(safeDate.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} • ${hours}:${minutes}`;
}

function maskCep(value = '') {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeManualDate(value = '') {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function normalizeManualTime(value = '') {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseManualDateTime(dateText, timeText) {
  const dateMatch = String(dateText || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const timeMatch = String(timeText || '').trim().match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]) - 1;
  const year = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours > 23 || minutes > 59 || day < 1 || day > 31) return null;

  const parsed = new Date(year, month, day, hours, minutes, 0, 0);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

let nativeDateTimePickerAndroid = null;
function getNativeDateTimePickerAndroid() {
  if (nativeDateTimePickerAndroid !== null) return nativeDateTimePickerAndroid;

  try {
    const dynamicRequire = Function('return require')();
    const pickerModule = dynamicRequire('@react-native-community/datetimepicker');
    nativeDateTimePickerAndroid = pickerModule?.DateTimePickerAndroid || null;
  } catch (error) {
    nativeDateTimePickerAndroid = null;
  }

  return nativeDateTimePickerAndroid;
}

function buildAddressFromCepPayload(payload) {
  if (!payload) return null;
  return {
    street: String(payload?.logradouro || '').trim(),
    district: String(payload?.bairro || '').trim(),
    cityState: [payload?.localidade, payload?.uf].filter(Boolean).join('/'),
  };
}

function buildEventLocationFromParts({ street, number, district, complement, cityState }) {
  const safeStreet = String(street || '').trim();
  const safeNumber = String(number || '').trim();
  const safeDistrict = String(district || '').trim();
  const safeComplement = String(complement || '').trim();
  const safeCityState = String(cityState || '').trim();

  const lineOne = [safeStreet, safeNumber ? `nº ${safeNumber}` : ''].filter(Boolean).join(', ');
  const lineTwo = [safeDistrict, safeCityState].filter(Boolean).join(' • ');

  return [lineOne, lineTwo, safeComplement ? `Compl.: ${safeComplement}` : '']
    .filter(Boolean)
    .join(' • ');
}

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
  const [eventDateValue, setEventDateValue] = useState(null);
  const [eventDatePickerFallbackOpen, setEventDatePickerFallbackOpen] = useState(false);
  const [eventManualDate, setEventManualDate] = useState('');
  const [eventManualTime, setEventManualTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStreet, setEventStreet] = useState('');
  const [eventNumber, setEventNumber] = useState('');
  const [eventDistrict, setEventDistrict] = useState('');
  const [eventComplement, setEventComplement] = useState('');
  const [eventLocationMode, setEventLocationMode] = useState('manual');
  const [eventCep, setEventCep] = useState('');
  const [eventCepLoading, setEventCepLoading] = useState(false);
  const [eventMaxCapacity, setEventMaxCapacity] = useState('');
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
  const eventLocationPreview = useMemo(
    () => buildEventLocationFromParts({
      street: eventStreet,
      number: eventNumber,
      district: eventDistrict,
      complement: eventComplement,
      cityState: eventLocation,
    }),
    [eventStreet, eventNumber, eventDistrict, eventComplement, eventLocation]
  );
  const eventAddressValidation = useMemo(() => {
    const missing = [];

    if (!String(eventStreet || '').trim()) missing.push('logradouro');
    if (!String(eventNumber || '').trim()) missing.push('número');
    if (!String(eventDistrict || '').trim()) missing.push('bairro');
    if (!String(eventLocation || '').trim()) missing.push('cidade/UF');

    return {
      isComplete: missing.length === 0,
      missing,
    };
  }, [eventStreet, eventNumber, eventDistrict, eventLocation]);
  const eventPublishValidation = useMemo(() => {
    const missing = [...eventAddressValidation.missing];

    if (!String(eventDate || '').trim()) missing.push('data/hora');

    const maxCapacityValue = Number.parseInt(String(eventMaxCapacity || '').trim(), 10);
    if (!Number.isFinite(maxCapacityValue) || maxCapacityValue <= 0) {
      missing.push('capacidade máxima');
    }

    return {
      isComplete: missing.length === 0,
      missing,
    };
  }, [eventAddressValidation.missing, eventDate, eventMaxCapacity]);
  const isEventPublishBlocked = type === 'event' && !eventPublishValidation.isComplete;
  const eventPublishBlockReason = isEventPublishBlocked
    ? `Para publicar o evento, complete: ${eventPublishValidation.missing.join(', ')}.`
    : '';

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

  const applySelectedEventDateTime = (dateObject) => {
    if (!dateObject || Number.isNaN(dateObject.getTime())) return;
    setEventDateValue(dateObject);
    setEventDate(formatDateTimeLabel(dateObject));
  };

  const openEventDateTimePicker = () => {
    const initialDate = eventDateValue instanceof Date && !Number.isNaN(eventDateValue.getTime())
      ? eventDateValue
      : new Date();

    if (Platform.OS === 'android') {
      const pickerAndroid = getNativeDateTimePickerAndroid();
      if (pickerAndroid?.open) {
        pickerAndroid.open({
          value: initialDate,
          mode: 'date',
          is24Hour: true,
          onChange: ({ type: dateType }, selectedDate) => {
            if (dateType !== 'set' || !selectedDate) return;

            pickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: ({ type: timeType }, selectedTime) => {
                if (timeType !== 'set' || !selectedTime) return;

                const finalDate = new Date(selectedDate);
                finalDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
                applySelectedEventDateTime(finalDate);
              },
            });
          },
        });
        return;
      }
    }

    const fallbackDate = eventDateValue instanceof Date && !Number.isNaN(eventDateValue.getTime())
      ? eventDateValue
      : initialDate;

    const fallbackDay = String(fallbackDate.getDate()).padStart(2, '0');
    const fallbackMonth = String(fallbackDate.getMonth() + 1).padStart(2, '0');
    const fallbackYear = String(fallbackDate.getFullYear());
    const fallbackHour = String(fallbackDate.getHours()).padStart(2, '0');
    const fallbackMinute = String(fallbackDate.getMinutes()).padStart(2, '0');

    setEventManualDate(`${fallbackDay}/${fallbackMonth}/${fallbackYear}`);
    setEventManualTime(`${fallbackHour}:${fallbackMinute}`);
    setEventDatePickerFallbackOpen(true);
  };

  const confirmFallbackEventDate = () => {
    const parsed = parseManualDateTime(eventManualDate, eventManualTime);
    if (!parsed) {
      alert('Informe data e hora válidas. Exemplo: 25/02/2026 e 21:30.');
      return;
    }

    applySelectedEventDateTime(parsed);
    setEventDatePickerFallbackOpen(false);
  };

  const applyCepToLocation = async () => {
    const normalizedCep = String(eventCep || '').replace(/\D/g, '').slice(0, 8);
    if (normalizedCep.length !== 8) {
      alert('Informe um CEP válido com 8 dígitos.');
      return;
    }

    try {
      setEventCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
      if (!response.ok) throw new Error('Falha na busca do CEP.');

      const payload = await response.json();
      if (payload?.erro) {
        alert('CEP não encontrado.');
        return;
      }

      const resolvedAddress = buildAddressFromCepPayload(payload);
      if (!resolvedAddress) {
        alert('CEP localizado, mas sem endereço completo.');
        return;
      }

      setEventStreet(resolvedAddress.street || '');
      setEventDistrict(resolvedAddress.district || '');
      if (resolvedAddress.cityState) setEventLocation(resolvedAddress.cityState);
      alert('Logradouro e bairro preenchidos pelo CEP. Complete número/complemento se necessário.');
    } catch (error) {
      alert('Não foi possível buscar o CEP agora.');
    } finally {
      setEventCepLoading(false);
    }
  };

  const publish = () => {
    if (isEventPublishBlocked) {
      alert(eventPublishBlockReason || 'Complete os campos obrigatórios do evento para publicar.');
      return;
    }

    try {
      const resolvedEventLocation = type === 'event'
        ? buildEventLocationFromParts({
          street: eventStreet,
          number: eventNumber,
          district: eventDistrict,
          complement: eventComplement,
          cityState: eventLocation,
        })
        : eventLocation;

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
        eventLocation: resolvedEventLocation,
        maxCapacity: eventMaxCapacity,
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
      setEventDateValue(null);
      setEventDatePickerFallbackOpen(false);
      setEventManualDate('');
      setEventManualTime('');
      setEventLocation('');
      setEventStreet('');
      setEventNumber('');
      setEventDistrict('');
      setEventComplement('');
      setEventLocationMode('manual');
      setEventCep('');
      setEventMaxCapacity('');
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
            <PressScale style={styles.datePickerButtonWrap} onPress={openEventDateTimePicker}>
              <View style={styles.datePickerButton}>
                <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
                <Text style={[styles.datePickerButtonText, !eventDate && styles.datePickerButtonPlaceholder]}>
                  {eventDate || 'Selecionar data e hora'}
                </Text>
              </View>
            </PressScale>

            <View style={styles.locationModeRow}>
              <Text style={styles.metaLabel}>Local:</Text>
              <PressScale style={styles.scopeBtnWrap} onPress={() => setEventLocationMode('manual')}>
                <View style={[styles.scopeBtn, eventLocationMode === 'manual' && styles.scopeBtnActive]}>
                  <Text style={[styles.scopeText, eventLocationMode === 'manual' && styles.scopeTextActive]}>Manual</Text>
                </View>
              </PressScale>
              <PressScale style={styles.scopeBtnWrap} onPress={() => setEventLocationMode('cep')}>
                <View style={[styles.scopeBtn, eventLocationMode === 'cep' && styles.scopeBtnActive]}>
                  <Text style={[styles.scopeText, eventLocationMode === 'cep' && styles.scopeTextActive]}>CEP</Text>
                </View>
              </PressScale>
            </View>

            {eventLocationMode === 'cep' && (
              <View style={styles.cepRow}>
                <TextInput
                  value={eventCep}
                  onChangeText={(value) => setEventCep(maskCep(value))}
                  placeholder="CEP (ex: 01310-100)"
                  placeholderTextColor="#666"
                  style={[styles.input, styles.cepInput]}
                  keyboardType="number-pad"
                />

                <PressScale style={styles.cepButtonWrap} onPress={applyCepToLocation} disabled={eventCepLoading}>
                  <View style={[styles.cepButton, eventCepLoading && styles.cepButtonDisabled]}>
                    <Text style={styles.cepButtonText}>{eventCepLoading ? 'Buscando...' : 'Buscar CEP'}</Text>
                  </View>
                </PressScale>
              </View>
            )}

            <Text style={styles.formSectionLabel}>Endereço detalhado</Text>

            <TextInput
              value={eventStreet}
              onChangeText={setEventStreet}
              placeholder="Logradouro (ex: Rua Augusta)"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <View style={styles.addressRow}>
              <TextInput
                value={eventNumber}
                onChangeText={(value) => setEventNumber(String(value || '').replace(/\D/g, '').slice(0, 8))}
                placeholder="Número"
                placeholderTextColor="#666"
                style={[styles.input, styles.addressFieldHalf]}
                keyboardType="number-pad"
              />

              <TextInput
                value={eventDistrict}
                onChangeText={setEventDistrict}
                placeholder="Bairro"
                placeholderTextColor="#666"
                style={[styles.input, styles.addressFieldHalf]}
              />
            </View>

            <TextInput
              value={eventComplement}
              onChangeText={setEventComplement}
              placeholder="Complemento (opcional)"
              placeholderTextColor="#666"
              style={styles.input}
            />

            <TextInput
              value={eventLocation}
              onChangeText={setEventLocation}
              placeholder={eventLocationMode === 'cep' ? 'Cidade/UF (ex: São Paulo/SP)' : 'Cidade/UF ou referência geral'}
              placeholderTextColor="#666"
              style={styles.input}
            />

            <View style={styles.locationPreviewBox}>
              <View style={styles.locationStatusRow}>
                <Text style={styles.locationPreviewLabel}>Prévia do endereço final</Text>
                <View
                  style={[
                    styles.locationStatusBadge,
                    eventAddressValidation.isComplete ? styles.locationStatusComplete : styles.locationStatusIncomplete,
                  ]}
                >
                  <Text
                    style={[
                      styles.locationStatusText,
                      eventAddressValidation.isComplete ? styles.locationStatusTextComplete : styles.locationStatusTextIncomplete,
                    ]}
                  >
                    {eventAddressValidation.isComplete ? 'Endereço completo' : 'Endereço incompleto'}
                  </Text>
                </View>
              </View>
              <Text style={styles.locationPreviewText}>
                {eventLocationPreview || 'Preencha logradouro, número, bairro e cidade/UF para montar a prévia.'}
              </Text>
              {!eventAddressValidation.isComplete && (
                <Text style={styles.locationMissingText}>
                  Falta preencher: {eventAddressValidation.missing.join(', ')}.
                </Text>
              )}
            </View>

            <Text style={styles.formSectionLabel}>Capacidade do evento (obrigatório)</Text>
            <TextInput
              value={eventMaxCapacity}
              onChangeText={(value) => setEventMaxCapacity(String(value || '').replace(/\D/g, '').slice(0, 6))}
              placeholder="Limite máximo de pessoas (ex: 80)"
              placeholderTextColor="#666"
              style={styles.input}
              keyboardType="number-pad"
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

            {eventIsPaid && !String(eventPriceLabel || '').trim() && (
              <Text style={styles.modalHint}>Se o valor ficar vazio, o tributo não será exibido no evento.</Text>
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
          {isEventPublishBlocked && (
            <Text style={styles.publishBlockedHint}>{eventPublishBlockReason}</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={eventDatePickerFallbackOpen} transparent animationType="fade" onRequestClose={() => setEventDatePickerFallbackOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Definir data e hora</Text>
            <Text style={styles.modalHint}>Preencha no formato DD/MM/AAAA e HH:MM (24h).</Text>

            <TextInput
              value={eventManualDate}
              onChangeText={(value) => setEventManualDate(normalizeManualDate(value))}
              placeholder="Data (ex: 25/02/2026)"
              placeholderTextColor="#666"
              style={[styles.input, { marginBottom: 8 }]}
              keyboardType="number-pad"
            />

            <TextInput
              value={eventManualTime}
              onChangeText={(value) => setEventManualTime(normalizeManualTime(value))}
              placeholder="Hora (ex: 21:30)"
              placeholderTextColor="#666"
              style={[styles.input, { marginBottom: 8 }]}
              keyboardType="number-pad"
            />

            <View style={styles.modalActions}>
              <PressScale style={styles.modalActionWrap} onPress={() => setEventDatePickerFallbackOpen(false)}>
                <View style={styles.btnGhost}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </View>
              </PressScale>

              <PressScale style={styles.modalActionWrap} onPress={confirmFallbackEventDate}>
                <View style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Aplicar</Text>
                </View>
              </PressScale>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
  },
  modalHint: {
    color: '#999',
    fontFamily: 'Lato_400Regular',
    marginTop: 6,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalActionWrap: {
    borderRadius: 8,
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
  datePickerButtonWrap: {
    borderRadius: 10,
    marginBottom: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#121212',
    color: '#EEE',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerButtonText: {
    marginLeft: 8,
    color: '#EEE',
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
  },
  datePickerButtonPlaceholder: {
    color: '#666',
  },
  locationModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  formSectionLabel: {
    color: '#AFAFAF',
    fontFamily: 'Lato_700Bold',
    marginBottom: 6,
    marginTop: 2,
    fontSize: 12,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addressFieldHalf: {
    flex: 1,
  },
  cepRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 2,
  },
  cepInput: {
    flex: 1,
    marginBottom: 8,
  },
  cepButtonWrap: {
    borderRadius: 8,
    marginBottom: 8,
  },
  cepButton: {
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 200, 0, 0.08)',
  },
  cepButtonDisabled: {
    opacity: 0.55,
  },
  cepButtonText: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  locationPreviewBox: {
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 10,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 10,
  },
  locationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  locationPreviewLabel: {
    color: '#AFAFAF',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  locationStatusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locationStatusComplete: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  locationStatusIncomplete: {
    borderColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  locationStatusText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
  },
  locationStatusTextComplete: {
    color: '#2ecc71',
  },
  locationStatusTextIncomplete: {
    color: '#e74c3c',
  },
  locationPreviewText: {
    color: '#D2D2D2',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  locationMissingText: {
    marginTop: 6,
    color: '#e89b92',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  publishBlockedHint: {
    marginTop: 8,
    color: '#e89b92',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
});