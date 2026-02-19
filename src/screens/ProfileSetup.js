import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import Input from '../components/Input';

// Intenções do Público (Aventureiro)
const VIEWER_INTENTIONS = [
    { id: 'solo', label: 'Jornada Solo', icon: 'person' },
    { id: 'date', label: 'Encontro Romântico', icon: 'heart' },
    { id: 'friends', label: 'Role com a Guilda', icon: 'people' },
    { id: 'business', label: 'Networking', icon: 'briefcase' },
];

// Formação do Artista (Bardo)
const ARTIST_ENTITIES = [
    { id: 'solo', label: 'Lobo Solitário (CPF)', icon: 'person' },
    { id: 'guild', label: 'A Guilda (Banda/CNPJ)', icon: 'people' },
];

export default function ProfileSetup({ userProfile, onFinish }) {
    const [bio, setBio] = useState('');

    // Estados para Aventureiro
    const [intention, setIntention] = useState('solo');

    // Estados para Artista
    const [entityType, setEntityType] = useState('solo');
    const [techRider, setTechRider] = useState('');
    const [artistName, setArtistName] = useState('');
    const [artistHandle, setArtistHandle] = useState('');
    const [artistVibe, setArtistVibe] = useState('');
    const [portfolioLink, setPortfolioLink] = useState('');
    const [galleryLink, setGalleryLink] = useState('');

    const handleFinish = () => {
      onFinish?.({
        userProfile,
        profileSetup: {
          bio,
          intention,
          entityType,
          techRider,
          artistName,
          artistHandle,
          artistVibe,
          links: {
            portfolio: portfolioLink,
            gallery: galleryLink,
          },
        },
      });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.headerTitle}>Sua Identidade</Text>
            <Text style={styles.subtitle}>
                {userProfile === 'artist' ? 'Forje sua vitrine profissional no Caos.' : 'Como você quer ser visto na noite?'}
            </Text>

            {/* 1. AVATAR (Comum a todos) */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color={THEME.colors.primary} />
                </View>
                <Text style={styles.avatarText}>Adicionar Retrato</Text>
            </View>

            {/* 2. CAMPOS BÁSICOS (Comum a todos) */}
            <View style={styles.form}>
                <Input
                    label="Sua Base"
                    placeholder="Qual sua cidade atual?"
                />

                <Text style={styles.label}>Sua História (Bio)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder={userProfile === 'artist' ? 'Fale sobre sua arte, influências e trajetória...' : 'Conte o que te move...'}
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    value={bio}
                    onChangeText={setBio}
                />
            </View>

            {/* ========================================= */}
            {/* 3A. FLUXO DO AVENTUREIRO (Público)        */}
            {/* ========================================= */}
            {userProfile === 'viewer' && (
                <>
                    <Text style={[styles.label, { marginTop: 20, textAlign: 'center' }]}>
                        Qual seu objetivo principal?
                    </Text>
                    <View style={styles.rowGrid}>
                        {VIEWER_INTENTIONS.map((item) => {
                            const isSelected = intention === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.cardSelection, isSelected && styles.cardSelected]}
                                    onPress={() => setIntention(item.id)}
                                >
                                    <Ionicons name={item.icon} size={24} color={isSelected ? THEME.colors.textDark : '#888'} />
                                    <Text style={[styles.cardText, isSelected && styles.textSelected]}>{item.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </>
            )}

            {/* ========================================= */}
            {/* 3B. FLUXO DO ARTISTA (Bardo)              */}
            {/* ========================================= */}
            {userProfile === 'artist' && (
                <View style={styles.artistSection}>

                    {/* Entidade */}
                    <Text style={styles.label}>Formação da Entidade</Text>
                    <View style={styles.rowGrid}>
                        {ARTIST_ENTITIES.map((item) => {
                            const isSelected = entityType === item.id;
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.cardSelection, isSelected && styles.cardSelected]}
                                    onPress={() => setEntityType(item.id)}
                                >
                                    <Ionicons name={item.icon} size={24} color={isSelected ? THEME.colors.textDark : '#888'} />
                                    <Text style={[styles.cardText, isSelected && styles.textSelected]}>{item.label}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* O Arsenal (Links) */}
                    <View style={{ marginTop: 20 }}>
                        <Input
                          label="O Chamado (Spotify/Soundcloud)"
                          placeholder="Link para sua música"
                          value={portfolioLink}
                          onChangeText={setPortfolioLink}
                        />
                        <Input
                          label="Galeria Visual (Instagram/YouTube)"
                          placeholder="Link para vídeos/fotos"
                          value={galleryLink}
                          onChangeText={setGalleryLink}
                        />
                    </View>

                    {/* Rider Técnico */}
                    <Text style={styles.label}>Rider Técnico (Exigências do Palco)</Text>
                    <TextInput
                        style={[styles.textArea, { height: 80 }]}
                        placeholder="Ex: Preciso de 2 microfones, bateria no local e 3 vias de retorno."
                        placeholderTextColor="#666"
                        multiline
                        value={techRider}
                        onChangeText={setTechRider}
                    />
                    <Text style={styles.helperText}>Isso agiliza os contratos com os Taverneiros.</Text>
                </View>
            )}

            {/* ========================================= */}
            {/* 3C. FLUXO DO ANFITRIÃO (Bar) - Em breve  */}
            {/* ========================================= */}
            {userProfile === 'host' && (
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.label}>Em breve configuraremos a sua Taverna...</Text>
                </View>
            )}

            <View style={{ height: 40 }} />

            <Button
                title="Adentrar o Portal (Finalizar)"
                type="primary"
                onPress={handleFinish}
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: THEME.colors.background,
        padding: 24,
        paddingTop: 60,
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: THEME.colors.primary, //
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        color: THEME.colors.primary,
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    },
    form: {
        width: '100%',
    },
    label: {
        fontFamily: 'Lato_700Bold',
        color: THEME.colors.primary,
        marginBottom: 8,
        fontSize: 14,
    },
    textArea: {
        backgroundColor: THEME.colors.secondary,
        color: THEME.colors.text,
        fontFamily: 'Lato_400Regular',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    rowGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cardSelection: {
        width: '48%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    cardSelected: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    cardText: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Lato_700Bold',
        textAlign: 'center',
    },
    textSelected: {
        color: THEME.colors.textDark,
    },
    artistSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingTop: 20,
    },
    helperText: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'Lato_400Regular',
        marginTop: 4,
        fontStyle: 'italic',
    }
});