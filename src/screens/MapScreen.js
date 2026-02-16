import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { DARK_MAP_STYLE } from '../styles/mapStyle';

// Dados Fakes de Eventos (Chamas)
const EVENTS = [
  { id: '1', title: 'Bar do Zé', type: 'Morno', lat: -25.4284, lng: -49.2733, desc: 'Cerveja gelada e rock clássico.' },
  { id: '2', title: 'Porão do Metal', type: 'Ardendo', lat: -25.4354, lng: -49.2713, desc: 'Banda ao vivo tocando Metallica.' },
  { id: '3', title: 'Teatro das Sombras', type: 'Frio', lat: -25.4400, lng: -49.2800, desc: 'Peça experimental às 20h.' },
];

export default function MapScreen({ onOpenMenu }) { // Recebe função para abrir o menu
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Localização inicial (Curitiba como exemplo, já que você está aí!)
  const initialRegion = {
    latitude: -25.4284,
    longitude: -49.2733,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      
      {/* MAPA */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={DARK_MAP_STYLE} // Aplica o estilo dark
        initialRegion={initialRegion}
        showsUserLocation={true} // Mostra bolinha azul do usuário (precisa de permissão)
      >
        {EVENTS.map(event => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.lat, longitude: event.lng }}
            onPress={() => setSelectedEvent(event)}
          >
            {/* Ícone Personalizado (Chama) */}
            <View style={styles.markerContainer}>
              <Ionicons 
                name="flame" 
                size={event.type === 'Ardendo' ? 40 : 28} 
                color={event.type === 'Ardendo' ? '#FF4500' : THEME.colors.primary} 
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* BOTÃO DO MENU (Flutuante no topo) */}
      <TouchableOpacity style={styles.menuButton} onPress={onOpenMenu}>
        <Ionicons name="menu" size={28} color={THEME.colors.primary} />
      </TouchableOpacity>

      {/* MODAL DE DETALHES (Slide-up) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedEvent !== null}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Botão Fechar */}
            <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedEvent(null)}
            >
                <Ionicons name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>

            {selectedEvent && (
                <>
                    <View style={styles.headerRow}>
                        <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                        <View style={[
                            styles.badge, 
                            { backgroundColor: selectedEvent.type === 'Ardendo' ? '#FF4500' : '#444'}
                        ]}>
                            <Ionicons name="flame" size={12} color="#FFF" style={{marginRight: 4}} />
                            <Text style={styles.badgeText}>{selectedEvent.type}</Text>
                        </View>
                    </View>

                    <Text style={styles.modalDesc}>{selectedEvent.desc}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.btnAction}>
                            <Text style={styles.btnText}>Traçar Rota</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnAction, styles.btnPrimary]}>
                            <Text style={[styles.btnText, {color: '#000'}]}>Confirmar Presença</Text>
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