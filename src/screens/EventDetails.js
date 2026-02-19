import React from 'react';
import { View, Text, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import { getEventById } from '../service/feedPosts';

const { height } = Dimensions.get('window');

export default function EventDetails({ eventId, onBack }) {
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

  const sanityText =
    EVENT.sanityLevel <= 2 ? 'CALMO / INTROSPECTIVO' : EVENT.sanityLevel <= 3 ? 'EQUILIBRADO' : 'FRENÉTICO / CAÓTICO';

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
          <Text style={styles.blockTitle}>O Círculo ({EVENT.attendees.length + 12})</Text>
          <Text style={styles.helperText}>Aliados que confirmaram presença</Text>
          <View style={styles.attendeesRow}>
            {EVENT.attendees.map((user, index) => (
              <Image
                key={user.id}
                source={{ uri: user.avatar }}
                style={[styles.avatar, { marginLeft: index === 0 ? 0 : -15 }]}
              />
            ))}
            <View style={[styles.avatar, styles.moreAvatar]}>
              <Text style={styles.moreText}>+12</Text>
            </View>
          </View>
        </View>

        <Button
          title={EVENT.isPaid ? 'Oferecer Tributo' : 'Confirmar Presença'}
          type="primary"
          onPress={() => alert(EVENT.isPaid ? 'Tributo iniciado.' : 'Presença confirmada.')}
        />
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
  description: { color: '#B5B5B5', fontFamily: 'Lato_400Regular', fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 16 },
  block: { backgroundColor: '#141414', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#242424' },
  blockTitle: { color: '#FFF', fontFamily: 'Cinzel_700Bold', fontSize: 17, marginBottom: 8 },
  meterRow: { flexDirection: 'row', alignItems: 'flex-end' },
  meterBar: { width: 12, borderRadius: 4, marginRight: 6 },
  sanityLabel: { color: '#888', fontFamily: 'Lato_700Bold', fontSize: 12, marginLeft: 10, marginBottom: 2 },
  helperText: { color: '#777', fontFamily: 'Lato_400Regular', marginBottom: 10 },
  attendeesRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: THEME.colors.background },
  moreAvatar: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginLeft: -15 },
  moreText: { color: '#FFF', fontFamily: 'Lato_700Bold', fontSize: 13 },
});