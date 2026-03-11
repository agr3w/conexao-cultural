import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { DARK_MAP_STYLE } from '../styles/mapStyle';
import { getEventAvailability, getVisibleFeedPosts } from '../service/feedPosts';
import { getPlaceById } from '../service/places';

const ARTIST_TAVERNS = [
  {
    id: 'tavern_1',
    name: 'Porão do Metal',
    vibe: 'Metal autoral, alta energia e set pesado',
    hasOpenGig: true,
    latitude: -25.4343,
    longitude: -49.274,
  },
  {
    id: 'tavern_2',
    name: 'Taverna do Zé',
    vibe: 'Rock clássico e acústicos de quinta',
    hasOpenGig: false,
    latitude: -25.4261,
    longitude: -49.2695,
  },
  {
    id: 'tavern_3',
    name: 'Castelo Sonoro',
    vibe: 'Noites alternativas e experimentais',
    hasOpenGig: true,
    latitude: -25.4208,
    longitude: -49.2831,
  },
];

const DEFAULT_REGION = {
  latitude: -25.4284,
  longitude: -49.2733,
};

function getTemperatureFromEvent(eventPost) {
  const availability = getEventAvailability(eventPost);
  if (!availability) return 'warm';
  if (availability.status === 'full') return 'hot';
  if (availability.status === 'last') return 'hot';

  const maxCapacity = Number(eventPost?.maxCapacity || 0);
  const confirmedCount = Number(eventPost?.confirmedCount || 0);
  if (!maxCapacity || maxCapacity <= 0) return 'warm';

  const ratio = confirmedCount / maxCapacity;
  if (ratio < 0.35) return 'cold';
  if (ratio > 0.75) return 'hot';
  return 'warm';
}

function buildViewerRituals(ownerUserId) {
  const eventPosts = getVisibleFeedPosts('viewer', ownerUserId)
    .filter((post) => post.type === 'event' && String(post.placeId || '').trim());

  return eventPosts
    .map((eventPost) => {
      const place = getPlaceById(eventPost.placeId);
      if (!place) return null;

      const latitude = Number(place.latitude ?? place.lat);
      const longitude = Number(place.longitude ?? place.lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

      return {
        id: `map_ritual_${eventPost.id}`,
        eventId: eventPost.eventId || eventPost.id,
        placeId: place.id,
        title: eventPost.title || 'Ritual',
        place: place.name || eventPost.location || 'Local a definir',
        timeLabel: eventPost.date || 'Data a definir',
        latitude,
        longitude,
        temperature: getTemperatureFromEvent(eventPost),
      };
    })
    .filter(Boolean);
}

function getViewerFlameMeta(temperature = 'warm') {
  if (temperature === 'cold') {
    return {
      size: 24,
      color: '#4E6E8E',
      label: 'Frio',
    };
  }

  if (temperature === 'hot') {
    return {
      size: 38,
      color: '#C52828',
      label: 'Caos alto',
    };
  }

  return {
    size: 30,
    color: THEME.colors.primary,
    label: 'Aquecendo',
  };
}

function ViewerBottomSheet({ item, onClose, onOpenRitual }) {
  const flameMeta = getViewerFlameMeta(item?.temperature);

  return (
    <Modal
      animationType="slide"
      transparent
      visible={Boolean(item)}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>

          {item && (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.modalTitle}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: flameMeta.color }]}>
                  <Ionicons name="flame" size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{flameMeta.label}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={THEME.colors.primary} />
                <Text style={styles.metaText}>{item.place}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={16} color={THEME.colors.primary} />
                <Text style={styles.metaText}>{item.timeLabel}</Text>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionPrimaryButton, styles.viewerPrimaryButton]}
                onPress={() => {
                  onOpenRitual?.(item);
                  onClose?.();
                }}
              >
                <Ionicons name="sparkles-outline" size={16} color="#000" style={{ marginRight: 8 }} />
                <Text style={[styles.actionButtonText, styles.actionPrimaryButtonText]}>Ver Ritual</Text>
                <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ArtistBottomSheet({ item, onClose, onPlacePress, onPitchPress }) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={Boolean(item)}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>

          {item && (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.modalTitle}>{item.name}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.hasOpenGig ? THEME.colors.primary : '#3A3A3A' },
                  ]}
                >
                  <Ionicons name="business" size={12} color={item.hasOpenGig ? '#000' : '#E5E5E5'} style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, { color: item.hasOpenGig ? '#000' : '#E5E5E5' }]}>
                    {item.hasOpenGig ? 'Chamado aberto' : 'Prospecção'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="musical-notes-outline" size={16} color={THEME.colors.primary} />
                <Text style={styles.metaText}>{item.vibe}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    onPlacePress?.(item);
                    onClose?.();
                  }}
                >
                  <Text style={styles.actionButtonText}>Ver Bar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionPrimaryButton]}
                  onPress={() => {
                    onPitchPress?.(item);
                    onClose?.();
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.actionPrimaryButtonText]}>Enviar Tributo (Portfólio)</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function MapScreen({ userProfile = 'viewer', ownerUserId, refreshTick = 0, onOpenMenu, onPlacePress, onPitchPress, onOpenRitual }) {
  const isArtist = userProfile === 'artist';
  const [selectedViewerRitual, setSelectedViewerRitual] = useState(null);
  const [selectedArtistTavern, setSelectedArtistTavern] = useState(null);
  const [viewerRituals, setViewerRituals] = useState([]);

  useEffect(() => {
    const nextRituals = buildViewerRituals(ownerUserId);
    setViewerRituals(nextRituals);
  }, [ownerUserId, refreshTick]);

  const mapData = useMemo(() => (isArtist ? ARTIST_TAVERNS : viewerRituals), [isArtist, viewerRituals]);

  const initialRegion = {
    latitude: mapData[0]?.latitude ?? -25.4284,
    longitude: mapData[0]?.longitude ?? -49.2733,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleOpenViewerRitual = (ritual) => {
    onOpenRitual?.(ritual);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {isArtist
          ? ARTIST_TAVERNS.map((tavern) => (
            <Marker
              key={tavern.id}
              coordinate={{ latitude: tavern.latitude, longitude: tavern.longitude }}
              onPress={() => setSelectedArtistTavern(tavern)}
            >
              <View style={styles.markerContainer}>
                <Ionicons
                  name="business"
                  size={29}
                  color={tavern.hasOpenGig ? THEME.colors.primary : '#4A4A4A'}
                />
              </View>
            </Marker>
          ))
          : viewerRituals.map((ritual) => {
            const flameMeta = getViewerFlameMeta(ritual.temperature);

            return (
              <Marker
                key={ritual.id}
                coordinate={{ latitude: ritual.latitude, longitude: ritual.longitude }}
                onPress={() => setSelectedViewerRitual(ritual)}
              >
                <View style={styles.markerContainer}>
                  <Ionicons
                    name="flame"
                    size={flameMeta.size}
                    color={flameMeta.color}
                  />
                </View>
              </Marker>
            );
          })}
      </MapView>

      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>{isArtist ? 'MAPA MERCENÁRIO' : 'RADAR DO CAOS'}</Text>
      </View>

      <TouchableOpacity style={styles.menuButton} onPress={onOpenMenu}>
        <Ionicons name="menu" size={28} color={THEME.colors.primary} />
      </TouchableOpacity>

      {!isArtist && (
        <ViewerBottomSheet
          item={selectedViewerRitual}
          onClose={() => setSelectedViewerRitual(null)}
          onOpenRitual={handleOpenViewerRitual}
        />
      )}

      {isArtist && (
        <ArtistBottomSheet
          item={selectedArtistTavern}
          onClose={() => setSelectedArtistTavern(null)}
          onPlacePress={onPlacePress}
          onPitchPress={onPitchPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 25,
  },
  modeBadge: {
    position: 'absolute',
    top: 52,
    right: 16,
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(12,12,12,0.85)',
  },
  modeBadgeText: {
    color: '#D2D2D2',
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    letterSpacing: 0.7,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.primary,
  },
  closeButton: {
    alignSelf: 'center',
    marginBottom: 10,
    padding: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
    color: THEME.colors.primary,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaText: {
    marginLeft: 8,
    color: '#D0D0D0',
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionPrimaryButton: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  actionButtonText: {
    fontFamily: 'Lato_700Bold',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  actionPrimaryButtonText: {
    color: '#000',
  },
  viewerPrimaryButton: {
    marginTop: 18,
    borderRadius: 12,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
});