import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors'; //

const { width } = Dimensions.get('window');

// Altura compacta da barra superior
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 44;
const HEADER_HEIGHT = TOP_INSET + 48;

export default function UserProfile({ onBack }) {
    // Dados Mockados (Simulando Backend)
    const USER = {
        name: 'Viajante do Caos',
        handle: '@viajante_01',
        level: 5,
        title: 'Mestre dos Sussurros',
        avatar: 'https://i.pravatar.cc/300', // Imagem de exemplo
        xp: 75, // Porcentagem para o próximo nível
        stats: {
            events: 12,
            following: 45,
            followers: 120
        },
        badges: [
            { id: 1, name: 'Noctívago', icon: 'moon', color: '#9b59b6', desc: 'Saiu 5x após a meia-noite' },
            { id: 2, name: 'Patrono', icon: 'musical-notes', color: '#f1c40f', desc: 'Foi em 3 shows de Jazz' },
            { id: 3, name: 'Explorador', icon: 'map', color: '#2ecc71', desc: 'Visitou 5 locais novos' },
            { id: 4, name: 'Social', icon: 'people', color: '#e74c3c', desc: 'Levou 10 amigos para eventos' },
        ],
        memories: [
            { id: 101, event: 'Noite do Jazz Noir', date: '13/02/2026', image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=200' },
            { id: 102, event: 'Festival de Metal', date: '20/01/2026', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=200' },
            { id: 103, event: 'Teatro das Sombras', date: '15/12/2025', image: 'https://images.unsplash.com/photo-1503095392237-fc70339a2881?q=80&w=200' },
        ]
    };

    return (
        <View style={styles.container}>

            {/* 1. CABEÇALHO COM DEGRADÊ */}
            <LinearGradient
                colors={[THEME.colors.primary, '#000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.headerBackground}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* 2. AVATAR E INFO (O Retrato) */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: USER.avatar }} style={styles.avatar} />
                        {/* Moldura Mística (Borda Dourada baseada no nível) */}
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{USER.level}</Text>
                        </View>
                    </View>

                    <Text style={styles.name}>{USER.name}</Text>
                    <Text style={styles.title}>{USER.title}</Text>

                    {/* Barra de XP */}
                    <View style={styles.xpContainer}>
                        <View style={[styles.xpBar, { width: `${USER.xp}%` }]} />
                    </View>
                    <Text style={styles.xpText}>{USER.xp}% para o Nível {USER.level + 1}</Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{USER.stats.events}</Text>
                            <Text style={styles.statLabel}>Rituais</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{USER.stats.following}</Text>
                            <Text style={styles.statLabel}>Seguindo</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{USER.stats.followers}</Text>
                            <Text style={styles.statLabel}>Seguidores</Text>
                        </View>
                    </View>
                </View>

                {/* 3. INSÍGNIAS (Badges) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Conquistas Desbloqueadas</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
                        {USER.badges.map((badge) => (
                            <View key={badge.id} style={styles.badgeCard}>
                                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                                    <Ionicons name={badge.icon} size={24} color="#FFF" />
                                </View>
                                <Text style={styles.badgeName}>{badge.name}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. MEMÓRIAS (Histórico) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fragmentos de Memória</Text>
                    {USER.memories.map((memory) => (
                        <View key={memory.id} style={styles.memoryCard}>
                            <Image source={{ uri: memory.image }} style={styles.memoryImage} />
                            <View style={styles.memoryInfo}>
                                <Text style={styles.memoryTitle}>{memory.event}</Text>
                                <Text style={styles.memoryDate}>
                                    <Ionicons name="calendar-outline" size={12} color="#888" /> {memory.date}
                                </Text>
                                <View style={styles.ticketStub}>
                                    <Text style={styles.ticketText}>TICKET #{memory.id}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    headerBackground: {
        height: HEADER_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    backButton: {
        position: 'absolute',
        top: TOP_INSET + 6,
        left: 16,
        backgroundColor: 'rgba(255,200,0,0.8)', // Amarelo translúcido
        borderRadius: 16,
        padding: 6,
    },
    scrollContent: {
        paddingTop: HEADER_HEIGHT - 20, // menor espaço no topo
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 16,
        zIndex: 2,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: THEME.colors.background, // Borda preta para separar
    },
    levelBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: THEME.colors.primary, // Amarelo
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: THEME.colors.background,
    },
    levelText: {
        fontFamily: 'Cinzel_700Bold', //
        color: '#000',
        fontSize: 16,
    },
    name: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 26,
        color: THEME.colors.text,
        textAlign: 'center',
    },
    title: {
        fontFamily: 'Lato_400Regular', //
        color: THEME.colors.primary,
        fontSize: 14,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    xpContainer: {
        width: 200,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    xpBar: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
    },
    xpText: {
        color: '#666',
        fontSize: 10,
        fontFamily: 'Lato_400Regular',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#222',
        paddingVertical: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'Cinzel_700Bold',
        color: '#FFF',
        fontSize: 20,
    },
    statLabel: {
        fontFamily: 'Lato_400Regular',
        color: '#888',
        fontSize: 12,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontFamily: 'Cinzel_700Bold',
        color: THEME.colors.primary,
        fontSize: 18,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: THEME.colors.primary,
        paddingLeft: 10,
    },
    // Badges
    badgesScroll: {
        paddingBottom: 10,
    },
    badgeCard: {
        alignItems: 'center',
        marginRight: 20,
        width: 80,
    },
    badgeIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    badgeName: {
        color: '#CCC',
        fontSize: 10,
        textAlign: 'center',
        fontFamily: 'Lato_700Bold',
    },
    // Memories
    memoryCard: {
        flexDirection: 'row',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    memoryImage: {
        width: 100,
        height: '100%',
    },
    memoryInfo: {
        padding: 12,
        flex: 1,
    },
    memoryTitle: {
        fontFamily: 'Cinzel_700Bold',
        color: '#FFF',
        fontSize: 16,
        marginBottom: 4,
    },
    memoryDate: {
        color: '#888',
        fontSize: 12,
        marginBottom: 12,
        fontFamily: 'Lato_400Regular',
    },
    ticketStub: {
        alignSelf: 'flex-start',
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: THEME.colors.primary,
    },
    ticketText: {
        color: THEME.colors.primary,
        fontSize: 10,
        fontFamily: 'Lato_700Bold',
        letterSpacing: 1,
    }
});