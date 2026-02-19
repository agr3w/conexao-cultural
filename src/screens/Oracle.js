import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { getOracleResults } from '../service/oracleSearch';

// Substituir VIBES por filtros úteis
const ORACLE_FILTERS = [
  { id: 'all', label: 'Tudo', icon: 'apps', color: '#95a5a6' },
  { id: 'artist', label: 'Músicos', icon: 'musical-notes', color: '#f1c40f' },
  { id: 'place', label: 'Bares/Locais', icon: 'wine', color: '#3498db' },
  { id: 'community', label: 'Comunidades', icon: 'people', color: '#9b59b6' },
];

export default function Oracle({ onResultPress }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredResults = useMemo(
    () =>
      getOracleResults({
        searchText,
        selectedType: selectedFilter === 'all' ? null : selectedFilter,
      }),
    [searchText, selectedFilter]
  );

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
          {ORACLE_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  isSelected && { backgroundColor: filter.color, borderColor: filter.color },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isSelected ? '#000' : filter.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterText, isSelected && { color: '#000' }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. RESULTADOS (Lista) */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nada encontrado no grimório atual.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultCard} onPress={() => onResultPress?.(item)}>
            <Image source={{ uri: item.image }} style={styles.resultImage} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultType}>
                {item.type === 'artist'
                  ? 'Artista / Bardo'
                  : item.type === 'place'
                  ? 'Local / Santuário'
                  : 'Comunidade'}
              </Text>
            </View>
            {!!item.vibe && (
              <View style={styles.vibeBadge}>
                <Text style={styles.vibeBadgeText}>{item.vibe}</Text>
              </View>
            )}
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
  filterChip: {
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
  filterText: {
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