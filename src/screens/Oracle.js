import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { getOracleResults } from '../service/oracleSearch';
import ProfileAvatar from '../components/ProfileAvatar';

// Substituir VIBES por filtros úteis
const ORACLE_FILTERS = [
  { id: 'all', label: 'Tudo', icon: 'apps' },
  { id: 'artist', label: 'Artistas', icon: 'musical-notes' },
  { id: 'place', label: 'Locais', icon: 'wine' },
  { id: 'community', label: 'Comunidades', icon: 'people' },
];

function PressScale({ children, onPress, style, activeOpacity = 0.96 }) {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
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
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Oracle({ onResultPress }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('discover');
  const [showOnlyNewTrending, setShowOnlyNewTrending] = useState(false);

  const filteredResults = useMemo(
    () =>
      getOracleResults({
        searchText,
        selectedType: selectedFilter === 'all' ? null : selectedFilter,
      }),
    [searchText, selectedFilter]
  );

  const summary = useMemo(() => {
    const byType = filteredResults.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      { total: 0, artist: 0, place: 0, community: 0 }
    );

    return byType;
  }, [filteredResults]);

  const topTrendingResults = useMemo(
    () => [...filteredResults].sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0)).slice(0, 15),
    [filteredResults]
  );

  const isRecentlyCreated = (createdAt) => {
    if (!createdAt) return false;
    const timestamp = Date.parse(createdAt);
    if (Number.isNaN(timestamp)) return false;

    const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    return days <= 3;
  };

  const renderResultVisual = (item) => {
    if (item.type === 'place') {
      return <Image source={{ uri: item.image }} style={styles.resultImage} />;
    }

    return (
      <ProfileAvatar
        uri={item.image}
        name={item.name}
        variant={item.avatarFallbackStyle || 'sigil'}
        size={56}
        borderWidth={1}
        borderColor="#2F2F2F"
      />
    );
  };

  const getTypeLabel = (item) => {
    if (item.type === 'artist') return item.entity || 'Artista / Bardo';
    if (item.type === 'place') return item.category || 'Local / Santuário';
    return item.visibility === 'followers' ? 'Comunidade VIP' : 'Comunidade';
  };

  const getSubtitle = (item) => {
    if (item.type === 'artist') return item.vibe || 'Vibe não definida';
    if (item.type === 'place') return item.address || item.vibe || 'Endereço não informado';
    return item.artistName ? `Clã de ${item.artistName}` : 'Rede de fãs';
  };

  const displayedResults = useMemo(() => {
    if (viewMode !== 'trending') return filteredResults;
    if (!showOnlyNewTrending) return topTrendingResults;
    return topTrendingResults.filter((item) => isRecentlyCreated(item.createdAt));
  }, [viewMode, showOnlyNewTrending, topTrendingResults, filteredResults]);

  const newTrendingCount = useMemo(
    () => topTrendingResults.filter((item) => isRecentlyCreated(item.createdAt)).length,
    [topTrendingResults]
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>ORÁCULO</Text>
        <Text style={styles.subtitle}>Busca viva por artistas, locais e comunidades</Text>
      </View>

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
          {!!searchText && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.modeRow}>
        <PressScale style={styles.modeChipWrap} onPress={() => setViewMode('discover')}>
          <View style={[styles.modeChip, viewMode === 'discover' && styles.modeChipActive]}>
            <Ionicons name="compass-outline" size={14} color={viewMode === 'discover' ? '#000' : THEME.colors.primary} />
            <Text style={[styles.modeText, viewMode === 'discover' && styles.modeTextActive]}>Descobrir</Text>
          </View>
        </PressScale>

        <PressScale style={styles.modeChipWrap} onPress={() => setViewMode('trending')}>
          <View style={[styles.modeChip, viewMode === 'trending' && styles.modeChipActive]}>
            <Ionicons name="flame-outline" size={14} color={viewMode === 'trending' ? '#000' : THEME.colors.primary} />
            <Text style={[styles.modeText, viewMode === 'trending' && styles.modeTextActive]}>Em Alta Top 15</Text>
          </View>
        </PressScale>
      </View>

      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibesContainer}>
          {ORACLE_FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <PressScale
                key={filter.id}
                style={styles.filterChipWrap}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <View style={[styles.filterChip, isSelected && styles.filterChipActive]}>
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isSelected ? '#000' : THEME.colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                    {filter.label}
                  </Text>
                </View>
              </PressScale>
            );
          })}
        </ScrollView>
      </View>

      {viewMode === 'trending' && (
        <View style={styles.trendingToolsRow}>
          <PressScale style={styles.quickFilterWrap} onPress={() => setShowOnlyNewTrending((prev) => !prev)}>
            <View style={[styles.quickFilterChip, showOnlyNewTrending && styles.quickFilterChipActive]}>
              <Ionicons
                name={showOnlyNewTrending ? 'sparkles' : 'sparkles-outline'}
                size={14}
                color={showOnlyNewTrending ? '#000' : THEME.colors.primary}
              />
              <Text style={[styles.quickFilterText, showOnlyNewTrending && styles.quickFilterTextActive]}>
                Só NOVOS ({newTrendingCount})
              </Text>
            </View>
          </PressScale>
        </View>
      )}

      <FlatList
        data={displayedResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="sparkles-outline" size={26} color="#666" />
            <Text style={styles.emptyText}>Nada encontrado no grimório atual.</Text>
            <Text style={styles.emptySubText}>Tente outro termo, tipo ou combinação de busca.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <PressScale onPress={() => onResultPress?.(item)} style={styles.resultCardWrap}>
            <View style={styles.resultCard}>
              {renderResultVisual(item)}
              <View style={styles.resultInfo}>
                <View style={styles.resultNameRow}>
                  {viewMode === 'trending' && <Text style={styles.listRank}>#{index + 1}</Text>}
                  <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                  {isRecentlyCreated(item.createdAt) && <Text style={styles.newBadge}>NOVO</Text>}
                </View>
                <Text style={styles.resultType} numberOfLines={1}>{getTypeLabel(item)}</Text>
                <Text style={styles.resultMeta} numberOfLines={1}>{getSubtitle(item)}</Text>
                {!!item.tags && <Text style={styles.resultTags} numberOfLines={1}>{item.tags}</Text>}
              </View>
              <View style={styles.chevronWrap}>
                <Ionicons name="chevron-forward" size={18} color="#777" />
              </View>
            </View>
          </PressScale>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 42,
  },
  titleWrap: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 24,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 4,
    color: '#9A9A9A',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
  },
  searchHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modeChipWrap: {
    borderRadius: 18,
    flex: 1,
  },
  modeChip: {
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#151515',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  modeText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  modeTextActive: {
    color: '#000',
  },
  summaryChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#161616',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryNumber: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
  },
  summaryLabel: {
    color: '#8D8D8D',
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  vibesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  filterChipWrap: {
    borderRadius: 20,
    marginRight: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: 'rgba(30,30,30,0.5)',
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: '#000',
  },
  resultsList: {
    padding: 20,
    paddingBottom: 100,
  },
  trendingToolsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  quickFilterWrap: {
    borderRadius: 14,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#151515',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickFilterChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  quickFilterText: {
    color: '#CCC',
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  quickFilterTextActive: {
    color: '#000',
  },
  emptyWrap: {
    marginTop: 52,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Cinzel_700Bold',
  },
  emptySubText: {
    marginTop: 6,
    color: '#777',
    textAlign: 'center',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
  },
  resultCardWrap: {
    borderRadius: 12,
    marginBottom: 12,
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
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listRank: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 11,
  },
  resultName: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    flexShrink: 1,
  },
  resultType: {
    color: '#888',
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  resultMeta: {
    color: '#A4A4A4',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    marginTop: 3,
  },
  resultTags: {
    marginTop: 4,
    color: '#7F7F7F',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
  },
  chevronWrap: {
    marginLeft: 8,
  },
  newBadge: {
    backgroundColor: 'rgba(255, 200, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.5)',
    borderRadius: 8,
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  }
});