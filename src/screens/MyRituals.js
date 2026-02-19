import React from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

// Fluxo Público (Ingressos)
const MY_EVENTS = [
  {
    id: '1',
    title: 'Noite do Jazz Noir',
    date: 'Sexta-feira 13 • 22:00',
    image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=400',
    status: 'CONFIRMADO',
    countdown: '04h 32m',
  },
  {
    id: '2',
    title: 'Festival de Metal',
    date: '20/02/2026 • 20:00',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400',
    status: 'AGUARDANDO',
    countdown: '2 dias',
  },
];

// Fluxo Artista (Missões)
const ARTIST_MISSIONS = [
  {
    id: 'm1',
    place: 'Porão do Jazz',
    cache: 'R$ 800 + Consumo',
    soundcheck: '18:00',
    start: '22:00',
    status: 'Aguardando Contrato',
  },
  {
    id: 'm2',
    place: 'Inferno Club',
    cache: 'R$ 1.500',
    soundcheck: '19:30',
    start: '23:30',
    status: 'Confirmado',
  },
  {
    id: 'm3',
    place: 'Teatro das Sombras',
    cache: 'R$ 1.200',
    soundcheck: '16:00',
    start: '20:00',
    status: 'Concluído (Aguardando Pagamento)',
  },
];

const getStatusColor = (status) => {
  if (status === 'Confirmado') return THEME.colors.primary;
  if (status.includes('Concluído')) return '#2ecc71';
  return '#e67e22';
};

export default function MyRituals({ onBack, userProfile = 'viewer' }) {
  const isArtist = userProfile === 'artist';

  const renderTicket = ({ item }) => (
    <View style={styles.ticketCard}>
      <ImageBackground source={{ uri: item.image }} style={styles.ticketImage} imageStyle={{ borderRadius: 12 }}>
        <View style={styles.overlay} />

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        <View style={styles.ticketContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>

          <View style={styles.countdownContainer}>
            <Ionicons name="hourglass-outline" size={16} color={THEME.colors.primary} />
            <Text style={styles.countdownText}>Inicia em {item.countdown}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.ticketAction}>
        <TouchableOpacity style={styles.qrButton} onPress={() => alert('QR Code de Acesso Gerado!')}>
          <Ionicons name="qr-code-outline" size={24} color="#000" />
          <Text style={styles.qrText}>MOSTRAR SIGILO DE ACESSO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMission = ({ item }) => (
    <View style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionPlace}>{item.place}</Text>
        <View style={[styles.missionStatusBadge, { borderColor: getStatusColor(item.status) }]}>
          <Text style={[styles.missionStatusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.missionRow}>
        <Ionicons name="cash-outline" size={16} color={THEME.colors.primary} />
        <Text style={styles.missionText}>Tributo: {item.cache}</Text>
      </View>

      <View style={styles.missionRow}>
        <Ionicons name="mic-outline" size={16} color={THEME.colors.primary} />
        <Text style={styles.missionText}>Passagem de Som às {item.soundcheck}</Text>
      </View>

      <View style={styles.missionRow}>
        <Ionicons name="time-outline" size={16} color={THEME.colors.primary} />
        <Text style={styles.missionText}>Ritual inicia às {item.start}</Text>
      </View>

      <View style={styles.missionActions}>
        <TouchableOpacity style={styles.secondaryAction} onPress={() => alert('Abrindo acordo técnico / rider...')}>
          <Text style={styles.secondaryActionText}>Ver Acordo / Rider</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryAction} onPress={() => alert('Abrindo contato direto com o anfitrião...')}>
          <Text style={styles.primaryActionText}>Contato com Anfitrião</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const data = isArtist ? ARTIST_MISSIONS : MY_EVENTS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isArtist ? 'Missões Ativas' : 'Seus Pactos'}</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={isArtist ? renderMission : renderTicket}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isArtist ? 'Nenhuma missão ativa no momento...' : 'Nenhum pacto firmado ainda...'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 24,
    color: THEME.colors.text,
  },
  listContent: {
    padding: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'Lato_400Regular',
  },

  // Público
  ticketCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
    elevation: 5,
  },
  ticketImage: {
    height: 150,
    justifyContent: 'space-between',
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  statusBadge: {
    alignSelf: 'flex-end',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#000',
    fontSize: 10,
    fontFamily: 'Lato_700Bold',
  },
  ticketContent: {
    marginTop: 'auto',
  },
  eventTitle: {
    fontFamily: 'Cinzel_700Bold',
    color: '#FFF',
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  eventDate: {
    fontFamily: 'Lato_400Regular',
    color: '#DDD',
    fontSize: 12,
    marginBottom: 8,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    color: THEME.colors.primary,
    marginLeft: 6,
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  ticketAction: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderStyle: 'dashed',
  },
  qrButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  qrText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    marginLeft: 8,
    fontSize: 14,
  },

  // Artista
  missionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionPlace: {
    fontFamily: 'Cinzel_700Bold',
    color: THEME.colors.primary,
    fontSize: 18,
    flex: 1,
    marginRight: 10,
  },
  missionStatusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  missionStatusText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  missionText: {
    marginLeft: 8,
    color: '#DDD',
    fontFamily: 'Lato_400Regular',
  },
  missionActions: {
    marginTop: 14,
    gap: 10,
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#DDD',
    fontFamily: 'Lato_700Bold',
  },
  primaryAction: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
  },
});