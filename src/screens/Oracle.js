import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { PLACES } from '../service/places';

// As "Vibes" (Moods)
const VIBES = [
  { id: '1', label: 'Melancolia', icon: 'rainy', color: '#3498db' },
  { id: '2', label: 'Euforia', icon: 'flash', color: '#f1c40f' },
  { id: '3', label: 'Sombras', icon: 'moon', color: '#9b59b6' },
  { id: '4', label: 'Luxúria', icon: 'flame', color: '#e74c3c' },
  { id: '5', label: 'Caos', icon: 'skull', color: '#95a5a6' },
  { id: '6', label: 'Refúgio', icon: 'leaf', color: '#2ecc71' },
];

// Mock de Resultados (O que o Oráculo encontrou)
const ARTISTS = [
  { id: '101', type: 'artist', name: 'Sussurros da Noite', vibe: 'Melancolia', image: 'https://i.pravatar.cc/150?img=10' },
  { id: '103', type: 'artist', name: 'Lady Veneno', vibe: 'Luxúria', image: 'https://i.pravatar.cc/150?img=5' },
];

const RESULTS = [...ARTISTS, ...PLACES];

export default function Oracle({ onResultPress }) {
  const [searchText, setSearchText] = useState('');
  const [selectedVibe, setSelectedVibe] = useState(null);

  // Filtragem simples
  const filteredResults = RESULTS.filter(item => {
    if (selectedVibe && item.vibe !== selectedVibe) return false;
    if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>

      {/* 1. BARRA DE BUSCA (O Olho que Tudo Vê) */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="O que sua alma busca?"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 2. FILTRO DE VIBES (Horizontal) */}
      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibesContainer}>
          {VIBES.map((vibe) => {
            const isSelected = selectedVibe === vibe.label;
            return (
              <TouchableOpacity
                key={vibe.id}
                style={[
                  styles.vibeChip,
                  isSelected && { backgroundColor: vibe.color, borderColor: vibe.color }
                ]}
                onPress={() => setSelectedVibe(isSelected ? null : vibe.label)}
              >
                <Ionicons
                  name={vibe.icon}
                  size={16}
                  color={isSelected ? '#000' : vibe.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.vibeText, isSelected && { color: '#000' }]}>
                  {vibe.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. RESULTADOS (Lista) */}
      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>O Oráculo permanece em silêncio...</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() => {
              if (onResultPress) {
                onResultPress(item);
                return;
              }
              alert(`Cliquei em ${item.name}`);
            }}
          >
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultType}>
                {item.type === 'artist' ? 'Artista / Bardo' : 'Local / Santuário'}
              </Text>
            </View>
            <View style={styles.vibeBadge}>
              <Text style={styles.vibeBadgeText}>{item.vibe}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 50, // Espaço para status bar
  },
  searchHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
  },
  vibesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    backgroundColor: 'rgba(30,30,30,0.5)',
  },
  vibeText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  resultsList: {
    padding: 20,
    paddingBottom: 100, // Espaço para a barra inferior
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'Cinzel_700Bold',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
  },
  resultType: {
    color: '#888',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  vibeBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  vibeBadgeText: {
    color: '#CCC',
    fontSize: 10,
    fontFamily: 'Lato_700Bold',
  }
});