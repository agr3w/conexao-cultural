import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import { getEventAvailability, getEventById } from '../service/feedPosts';
import { addRitualToAgenda, cancelAgendaCommitment, getAgendaCommitmentBySource } from '../service/agenda';

const { height } = Dimensions.get('window');

export default function EventDetails({ eventId, onBack, ownerUserId, userProfile = 'viewer', onAgendaChanged }) {
  const EVENT = getEventById(eventId) || {
    id: eventId ?? '1',
    title: 'Evento indisponível',
    location: 'Local não informado',
    date: 'Data não informada',
    description: 'Este evento pode ter sido removido ou ainda não está disponível.',
    sanityLevel: 3,
    isPaid: false,
    priceLabel: null,
    attendees: [
      { id: 1, avatar: 'https://i.pravatar.cc/100?img=1' },
      { id: 2, avatar: 'https://i.pravatar.cc/100?img=5' },
      { id: 3, avatar: 'https://i.pravatar.cc/100?img=8' },
    ],
    image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop',
  };

  const eventCommitment = getAgendaCommitmentBySource({
    ownerUserId,
    sourceType: 'event',
    sourcePostId: EVENT.id,
  });
  const isConfirmed = eventCommitment?.status === 'confirmado';
  const isWaitlisted = eventCommitment?.status === 'lista_espera';
  const eventAvailability = getEventAvailability(EVENT.id);
  const isFullForNewConfirm = eventAvailability?.status === 'full' && !isConfirmed && !isWaitlisted;
  const confirmedCount = Math.max(0, Number(eventAvailability?.confirmedCount || 0));
  const visibleCircleIcons = Math.min(confirmedCount, 8);

  const sanityText =
    EVENT.sanityLevel <= 2 ? 'CALMO / INTROSPECTIVO' : EVENT.sanityLevel <= 3 ? 'EQUILIBRADO' : 'FRENÉTICO / CAÓTICO';

  const handleConfirmPresence = () => {
    if (isConfirmed || isWaitlisted) {
      return;
    }

    try {
      const sourceId = EVENT.eventId || EVENT.id || eventId;
      const result = addRitualToAgenda({
        ownerUserId,
        eventId: sourceId,
        userProfile,
      });
      onAgendaChanged?.();

      if (result?.status === 'lista_espera') {
        alert('Evento lotado: você entrou na lista de espera.');
        return;
      }

      alert(EVENT.isPaid ? 'Tributo iniciado e compromisso salvo na agenda.' : 'Presença confirmada e compromisso salvo na agenda.');
    } catch (error) {
      alert(error?.message || 'Não foi possível salvar este compromisso na agenda.');
    }
  };

  const handleCancelPresence = () => {
    if (!eventCommitment?.id) {
      alert('Você ainda não confirmou presença neste evento.');
      return;
    }

    try {
      cancelAgendaCommitment({
        ownerUserId,
        commitmentId: eventCommitment.id,
      });
      onAgendaChanged?.();
      alert('Presença cancelada com sucesso.');
    } catch (error) {
      alert(error?.message || 'Não foi possível cancelar presença agora.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={{ uri: EVENT.image }} style={styles.hero}>
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.7)', THEME.colors.background]}
          style={styles.gradient}
        />

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </ImageBackground>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLegend}>O CHAMADO</Text>
        <Text style={styles.title}>{EVENT.title}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.metaText}>{EVENT.date}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.metaText}>{EVENT.location}</Text>
        </View>

        {!!eventAvailability && (
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.metaText}>
              {eventAvailability.confirmedCount}/{eventAvailability.maxCapacity} confirmados • {eventAvailability.label}
            </Text>
          </View>
        )}

        {!!eventAvailability && (
          <View
            style={[
              styles.availabilityBadge,
              eventAvailability.status === 'full'
                ? styles.availabilityBadgeFull
                : eventAvailability.status === 'last'
                  ? styles.availabilityBadgeLast
                  : styles.availabilityBadgeAvailable,
            ]}
          >
            <Text style={styles.availabilityBadgeText}>{eventAvailability.label}</Text>
          </View>
        )}

        {EVENT.isPaid && !!EVENT.priceLabel && (
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.metaText}>{EVENT.priceLabel}</Text>
          </View>
        )}

        <Text style={styles.description}>{EVENT.description}</Text>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Nível de Sanidade</Text>
          <View style={styles.meterRow}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View
                key={item}
                style={[
                  styles.meterBar,
                  {
                    backgroundColor: item <= EVENT.sanityLevel ? (EVENT.sanityLevel > 3 ? '#8A0B0B' : THEME.colors.primary) : '#333',
                    height: 10 + item * 4,
                  },
                ]}
              />
            ))}
            <Text style={styles.sanityLabel}>{sanityText}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>O Círculo ({confirmedCount})</Text>
          <Text style={styles.helperText}>Aliados que confirmaram presença</Text>
          <View style={styles.attendeesRow}>
            {visibleCircleIcons > 0 ? (
              <>
                {Array.from({ length: visibleCircleIcons }).map((_, index) => (
                  <View
                    key={`attendee_icon_${index}`}
                    style={[styles.attendeeIconBubble, { marginLeft: index === 0 ? 0 : -13 }]}
                  >
                    <Ionicons name="person" size={18} color="#D8B35A" />
                  </View>
                ))}
                {confirmedCount > visibleCircleIcons && (
                  <View style={[styles.attendeeIconBubble, styles.moreAttendeesBubble]}>
                    <Text style={styles.moreText}>+{confirmedCount - visibleCircleIcons}</Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noAttendeesText}>Ainda sem confirmações.</Text>
            )}
          </View>
        </View>

        <Button
          title={
            isConfirmed
              ? 'Presença Confirmada'
              : isWaitlisted
                ? 'Na Lista de Espera'
                : isFullForNewConfirm
                  ? 'Entrar na Lista de Espera'
                : (EVENT.isPaid ? 'Oferecer Tributo' : 'Confirmar Presença')
          }
          type="primary"
          onPress={handleConfirmPresence}
        />

        {(isConfirmed || isWaitlisted) && (
          <Button
            title={isWaitlisted ? 'Sair da Lista de Espera' : 'Cancelar Presença'}
            type="secondary"
            onPress={handleCancelPresence}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  hero: { width: '100%', height: height * 0.5, justifyContent: 'flex-end' },
  gradient: { ...StyleSheet.absoluteFillObject },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
  },
  content: { marginTop: -36, paddingHorizontal: 20 },
  sectionLegend: { color: '#8A8A8A', fontSize: 12, letterSpacing: 1.2, marginBottom: 6, fontFamily: 'Lato_700Bold' },
  title: { fontFamily: 'Cinzel_700Bold', fontSize: 30, color: THEME.colors.primary, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaText: { color: '#DDD', marginLeft: 8, fontFamily: 'Lato_700Bold' },
  availabilityBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 10,
  },
  availabilityBadgeAvailable: {
    borderColor: '#3E3E3E',
    backgroundColor: '#1F1F1F',
  },
  availabilityBadgeLast: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(255, 200, 0, 0.08)',
  },
  availabilityBadgeFull: {
    borderColor: '#444',
    backgroundColor: '#222',
  },
  availabilityBadgeText: {
    color: '#D5D5D5',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  description: { color: '#B5B5B5', fontFamily: 'Lato_400Regular', fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 16 },
  block: { backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#242424' },
  blockTitle: { color: '#FFF', fontFamily: 'Cinzel_700Bold', fontSize: 17, marginBottom: 8 },
  meterRow: { flexDirection: 'row', alignItems: 'flex-end' },
  meterBar: { width: 12, borderRadius: 4, marginRight: 6 },
  sanityLabel: { color: '#888', fontFamily: 'Lato_700Bold', fontSize: 12, marginLeft: 10, marginBottom: 2 },
  helperText: { color: '#777', fontFamily: 'Lato_400Regular', marginBottom: 10 },
  attendeesRow: { flexDirection: 'row', alignItems: 'center' },
  attendeeIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAttendeesBubble: {
    marginLeft: -13,
    backgroundColor: '#2A2A2A',
    borderColor: '#4A4A4A',
  },
  noAttendeesText: {
    color: '#8E8E8E',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
  },
  moreText: { color: '#FFF', fontFamily: 'Lato_700Bold', fontSize: 13 },
});