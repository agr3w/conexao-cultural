import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { DARK_MAP_STYLE } from '../styles/mapStyle';
import { PLACES } from '../service/places';

const getHeatColor = (heat) => {
  if (heat === 'Ardendo') return '#FF4500';
  if (heat === 'Morno') return THEME.colors.primary;
  return '#4e6e8e';
};

export default function MapScreen({ onOpenMenu, onPlacePress }) {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const initialRegion = {
    latitude: PLACES[0]?.lat ?? -25.4284,
    longitude: PLACES[0]?.lng ?? -49.2733,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
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
        {PLACES.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={styles.markerContainer}>
              <Ionicons
                name="flame"
                size={place.heat === 'Ardendo' ? 40 : 28}
                color={getHeatColor(place.heat)}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.menuButton} onPress={onOpenMenu}>
        <Ionicons name="menu" size={28} color={THEME.colors.primary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={selectedPlace !== null}
        onRequestClose={() => setSelectedPlace(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
              <Ionicons name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>

            {selectedPlace && (
              <>
                <View style={styles.headerRow}>
                  <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                  <View style={[styles.badge, { backgroundColor: getHeatColor(selectedPlace.heat) }]}>
                    <Ionicons name="flame" size={12} color="#FFF" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>{selectedPlace.heat}</Text>
                  </View>
                </View>

                <Text style={styles.modalDesc}>{selectedPlace.description}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.btnAction}
                    onPress={() => alert(`Traçando rota para ${selectedPlace.name}...`)}
                  >
                    <Text style={styles.btnText}>Traçar Rota</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnAction, styles.btnPrimary]}
                    onPress={() => {
                      onPlacePress?.(selectedPlace);
                      setSelectedPlace(null);
                    }}
                  >
                    <Text style={[styles.btnText, { color: '#000' }]}>Abrir Perfil</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra para a chama brilhar no escuro
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
    fontSize: 22,
    color: THEME.colors.primary,
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
  modalDesc: {
    fontFamily: 'Lato_400Regular',
    color: '#CCC',
    fontSize: 16,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnAction: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    marginRight: 10,
  },
  btnPrimary: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
    marginRight: 0,
    marginLeft: 10,
  },
  btnText: {
    fontFamily: 'Lato_700Bold',
    color: '#FFF',
  }
});