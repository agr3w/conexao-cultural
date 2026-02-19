import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';

export default function PlaceProfile({ place, onBack, onOpenMap }) {
  const PLACE = {
    name: place?.name || 'Santuário Desconhecido',
    vibe: place?.vibe || 'Sem vibe definida',
    image: place?.image || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800',
    type: place?.category || 'Local / Santuário',
    address: place?.address || 'Centro Histórico, Curitiba - PR',
    description:
      place?.description ||
      'Um ponto de encontro para noites intensas, som autoral e experiências fora do comum.',
    nextEvent: place?.nextEvent || 'Sexta-feira • 22:00',
    capacity: place?.capacity || 180,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.coverWrap}>
          <Image source={{ uri: PLACE.image }} style={styles.cover} />
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{PLACE.name}</Text>
        <Text style={styles.type}>{PLACE.type}</Text>

        <View style={styles.badge}>
          <Ionicons name="flame" size={14} color="#000" />
          <Text style={styles.badgeText}>{PLACE.vibe}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoText}>{PLACE.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoText}>Próximo ritual: {PLACE.nextEvent}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color={THEME.colors.primary} />
          <Text style={styles.infoText}>Capacidade: {PLACE.capacity} pessoas</Text>
        </View>

        <Text style={styles.description}>{PLACE.description}</Text>

        <Button title="Ver no Mapa" type="secondary" onPress={onOpenMap} />
        <Button title="Confirmar Presença" type="primary" onPress={() => alert('Presença confirmada.')} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  content: { padding: 20, paddingBottom: 40 },
  coverWrap: { marginBottom: 14 },
  cover: { width: '100%', height: 220, borderRadius: 12 },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
  },
  name: {
    fontFamily: 'Cinzel_700Bold',
    color: THEME.colors.primary,
    fontSize: 28,
  },
  type: {
    marginTop: 4,
    color: '#888',
    fontFamily: 'Lato_400Regular',
  },
  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    marginLeft: 6,
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  infoText: { color: '#DDD', marginLeft: 8, fontFamily: 'Lato_400Regular' },
  description: {
    marginTop: 16,
    marginBottom: 20,
    color: '#B8B8B8',
    fontFamily: 'Lato_400Regular',
    lineHeight: 22,
  },
});