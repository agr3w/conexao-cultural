import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors'; //
import Button from '../components/Button';

const { height } = Dimensions.get('window');

export default function ArtistProfile({ onBack, isHost = false }) {
    // Dados Mockados do Artista (O que viria do Banco de Dados)
    const ARTIST = {
        name: 'Sussurros da Noite',
        handle: '@sussurros_noir',
        vibe: 'Melancolia / Jazz Noir',
        entity: 'A Guilda (Banda)',
        bio: 'Nascidos nas vielas escuras de Curitiba, trazemos o jazz de volta às suas raízes boêmias e sombrias. Saxofones que choram e baixos que rastejam.',
        cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800', // Foto de banda escura
        avatar: 'https://i.pravatar.cc/150?img=11',
        links: {
            spotify: 'https://spotify.com',
            instagram: 'https://instagram.com',
        },
        techRider: '1x Bateria Mapex (sem pratos), 2x Microfones Shure SM58, 1x Amplificador de Baixo (mínimo 100W).',
        reviews: [
            { id: '1', bar: 'Porão do Metal', text: 'Os caras lotaram a casa numa terça-feira chuvosa. Energia surreal.', rating: 5 },
            { id: '2', bar: 'Taverna do Zé', text: 'Chegaram no horário e não deram trabalho com o som. Recomendo.', rating: 5 },
        ]
    };

    return (
        <View style={styles.container}>

            {/* 1. O ALTAR (Capa e Avatar) */}
            <View style={styles.coverContainer}>
                <Image source={{ uri: ARTIST.cover }} style={styles.coverImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(15,15,15,0.9)', THEME.colors.background]}
                    style={styles.gradient}
                />
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Cabeçalho do Perfil */}
                <View style={styles.profileHeader}>
                    <Image source={{ uri: ARTIST.avatar }} style={styles.avatar} />
                    <Text style={styles.name}>{ARTIST.name}</Text>
                    <Text style={styles.handle}>{ARTIST.handle}</Text>

                    <View style={styles.vibeBadge}>
                        <Ionicons name="moon" size={14} color={THEME.colors.background} />
                        <Text style={styles.vibeText}>{ARTIST.vibe}</Text>
                    </View>
                </View>

                {/* Bio */}
                <Text style={styles.bio}>{ARTIST.bio}</Text>

                {/* Ação Principal (Contratar/Seguir) */}
                <View style={styles.actionRow}>
                    {/* Se quem está vendo for um Bar (isHost), mostra Contratar, senão Seguir */}
                    <Button
                        title="Oferecer Tributo (Contratar)"
                        type="primary"
                        onPress={() => alert('Abrindo proposta de contrato...')}
                    />
                </View>

                <View style={styles.divider} />

                {/* 2. O ARSENAL (Links Externos) */}
                <Text style={styles.sectionTitle}>O Arsenal</Text>
                <View style={styles.linksRow}>
                    <TouchableOpacity style={styles.linkCard} onPress={() => Linking.openURL(ARTIST.links.spotify)}>
                        <Ionicons name="musical-notes" size={24} color="#1DB954" />
                        <Text style={styles.linkText}>Ouvir Cânticos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkCard} onPress={() => Linking.openURL(ARTIST.links.instagram)}>
                        <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                        <Text style={styles.linkText}>Galeria Visual</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. EXIGÊNCIAS DO RITUAL (Tech Rider) */}
                <Text style={styles.sectionTitle}>Exigências do Palco</Text>
                <View style={styles.riderCard}>
                    <Ionicons name="construct-outline" size={24} color="#888" style={{ marginBottom: 8 }} />
                    <Text style={styles.riderText}>{ARTIST.techRider}</Text>
                    <Text style={styles.riderHelper}>Formação: {ARTIST.entity}</Text>
                </View>

                {/* 4. ECOS DO CAOS (Reviews) */}
                <Text style={styles.sectionTitle}>Ecos das Tavernas</Text>
                {ARTIST.reviews.map(review => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewerName}>{review.bar}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                {[...Array(review.rating)].map((_, i) => (
                                    <Ionicons key={i} name="star" size={12} color={THEME.colors.primary} />
                                ))}
                            </View>
                        </View>
                        <Text style={styles.reviewText}>"{review.text}"</Text>
                    </View>
                ))}

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    coverContainer: {
        width: '100%',
        height: height * 0.3,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        marginTop: -50, // Sobe para cruzar o degradê
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: THEME.colors.primary,
        marginBottom: 12,
    },
    name: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: THEME.colors.primary,
        textAlign: 'center',
    },
    handle: {
        fontFamily: 'Lato_400Regular',
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
    },
    vibeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    vibeText: {
        color: THEME.colors.background,
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    bio: {
        fontFamily: 'Lato_400Regular',
        color: '#CCC',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    actionRow: {
        width: '100%',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginVertical: 20,
    },
    sectionTitle: {
        fontFamily: 'Cinzel_700Bold',
        color: '#FFF',
        fontSize: 18,
        marginBottom: 12,
    },
    // Links
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    linkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        width: '48%',
    },
    linkText: {
        color: '#FFF',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
        marginLeft: 8,
    },
    // Rider
    riderCard: {
        backgroundColor: 'rgba(255, 200, 0, 0.05)', // Levemente amarelo
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 200, 0, 0.2)',
        marginBottom: 24,
    },
    riderText: {
        fontFamily: 'Lato_400Regular',
        color: '#DDD',
        fontSize: 14,
        lineHeight: 20,
    },
    riderHelper: {
        fontFamily: 'Lato_700Bold',
        color: THEME.colors.primary,
        fontSize: 12,
        marginTop: 12,
    },
    // Reviews
    reviewCard: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: THEME.colors.primary,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reviewerName: {
        fontFamily: 'Lato_700Bold',
        color: '#FFF',
        fontSize: 14,
    },
    reviewText: {
        fontFamily: 'Lato_400Regular',
        color: '#AAA',
        fontSize: 14,
        fontStyle: 'italic',
    }
});