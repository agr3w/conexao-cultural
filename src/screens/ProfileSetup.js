import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import Input from '../components/Input';
import ImageActionButtons from '../components/ImageActionButtons';
import ProfileAvatar, { FALLBACK_AVATAR_STYLES } from '../components/ProfileAvatar';
import { pickImageFromCamera, pickImageFromLibrary } from '../service/mediaPicker';

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

const VIBE_PRESETS = ['Rock', 'MPB', 'Jazz Noir', 'Eletrônico', 'Pop'];

const BIO_SUGGESTIONS = {
    viewer: [
        'Busco experiências culturais autênticas e novas conexões.',
        'Gosto de explorar eventos ao vivo e descobrir artistas locais.',
    ],
    artist: [
        'Projeto autoral focado em performances intensas e presença de palco.',
        'Misturo referências clássicas e contemporâneas em experiências ao vivo.',
    ],
};

export default function ProfileSetup({ userProfile, onFinish }) {
    const isArtist = userProfile === 'artist';
    const isViewer = userProfile === 'viewer';

    const [bio, setBio] = useState('');
    const [baseCity, setBaseCity] = useState('');

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
    const [avatarUrl, setAvatarUrl] = useState('');
    const [avatarFallbackStyle, setAvatarFallbackStyle] = useState('sigil');
    const [step, setStep] = useState(0);
    const [progressTrackWidth, setProgressTrackWidth] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const stepTitles = useMemo(() => {
        if (isArtist) return ['Retrato', 'Essência', 'Arsenal'];
        if (isViewer) return ['Retrato', 'Objetivo'];
        return ['Retrato', 'Perfil'];
    }, [isArtist, isViewer]);

    const totalSteps = stepTitles.length;

    useEffect(() => {
        const ratio = (step + 1) / totalSteps;
        Animated.timing(progressAnim, {
            toValue: ratio,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [step, totalSteps, progressAnim]);

    const animatedProgressStyle = {
        width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.max(progressTrackWidth, 1)],
        }),
    };

    const canAdvance = useMemo(() => {
        if (step === 0) return bio.trim().length >= 10 && baseCity.trim().length >= 2;
        if (isViewer && step === 1) return Boolean(intention);
        if (isArtist && step === 1) return artistName.trim().length >= 2 && artistHandle.trim().length >= 3;
        return true;
    }, [step, bio, baseCity, isViewer, intention, isArtist, artistName, artistHandle]);

    const handleFinish = () => {
      onFinish?.({
        userProfile,
        profileSetup: {
          bio,
          baseCity,
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
                    avatarUrl,
                    avatarFallbackStyle,
        },
      });
    };

    const goNext = () => {
        if (!canAdvance) {
            alert('Preencha os campos essenciais desta etapa para avançar.');
            return;
        }

        if (step >= totalSteps - 1) {
            handleFinish();
            return;
        }

        setStep((prev) => prev + 1);
    };

    const goBack = () => {
        if (step > 0) setStep((prev) => prev - 1);
    };

        const handlePickAvatarFromLibrary = async () => {
            try {
                const uri = await pickImageFromLibrary();
                if (uri) setAvatarUrl(uri);
            } catch (error) {
                alert(error?.message || 'Não foi possível abrir a galeria.');
            }
        };

        const handlePickAvatarFromCamera = async () => {
            try {
                const uri = await pickImageFromCamera();
                if (uri) setAvatarUrl(uri);
            } catch (error) {
                alert(error?.message || 'Não foi possível abrir a câmera.');
            }
        };

        const handleRemoveAvatar = () => {
            setAvatarUrl('');
        };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.headerTitle}>Sua Identidade</Text>
            <Text style={styles.subtitle}>
                {userProfile === 'artist' ? 'Forje sua vitrine profissional no Caos.' : 'Como você quer ser visto na noite?'}
            </Text>

            <View style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                    <Text style={styles.stepLabel}>Etapa {step + 1} de {totalSteps}</Text>
                    <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
                </View>
                <View
                    style={styles.progressTrack}
                    onLayout={(event) => {
                        const width = event?.nativeEvent?.layout?.width || 0;
                        if (width > 0) setProgressTrackWidth(width);
                    }}
                >
                    <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
                </View>
                <View style={styles.stepDotsRow}>
                    {stepTitles.map((title, index) => {
                        const active = index === step;
                        const done = index < step;
                        return (
                            <View key={title} style={styles.stepDotWrap}>
                                <View style={[styles.stepDot, (active || done) && styles.stepDotActive]} />
                                <Text style={[styles.stepDotText, active && styles.stepDotTextActive]}>{title}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {step === 0 && (
                <>
                    <View style={styles.avatarContainer}>
                        <ProfileAvatar
                            uri={avatarUrl}
                            name={artistName || 'Novo Perfil'}
                            variant={avatarFallbackStyle}
                            size={100}
                            borderWidth={1}
                            borderColor={THEME.colors.primary}
                            style={styles.avatarPreview}
                        />
                        <Text style={styles.avatarText}>Adicionar Retrato</Text>
                        <ImageActionButtons
                            onPickLibrary={handlePickAvatarFromLibrary}
                            onPickCamera={handlePickAvatarFromCamera}
                            onRemove={handleRemoveAvatar}
                        />

                        <Text style={styles.subSectionTitle}>Estilo do ícone sem foto</Text>
                        <View style={styles.styleRow}>
                            {FALLBACK_AVATAR_STYLES.map((item) => {
                                const selected = avatarFallbackStyle === item.id;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.styleChip, selected && styles.styleChipActive]}
                                        onPress={() => setAvatarFallbackStyle(item.id)}
                                    >
                                        <Ionicons name={item.icon} size={14} color={selected ? '#000' : THEME.colors.primary} />
                                        <Text style={[styles.styleChipText, selected && styles.styleChipTextActive]}>{item.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Sua Base"
                            placeholder="Qual sua cidade atual?"
                            value={baseCity}
                            onChangeText={setBaseCity}
                        />

                        <Text style={styles.label}>Sua História (Bio)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder={isArtist ? 'Fale sobre sua arte, influências e trajetória...' : 'Conte o que te move...'}
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={4}
                            value={bio}
                            onChangeText={setBio}
                        />

                        <Text style={styles.helperText}>Sugestões rápidas</Text>
                        <View style={styles.quickRow}>
                            {(BIO_SUGGESTIONS[userProfile] || []).map((suggestion) => (
                                <TouchableOpacity key={suggestion} style={styles.quickChip} onPress={() => setBio(suggestion)}>
                                    <Text style={styles.quickChipText}>Usar ideia</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </>
            )}

            {isViewer && step === 1 && (
                <>
                    <Text style={[styles.label, { marginTop: 6, textAlign: 'center' }]}>Qual seu objetivo principal?</Text>
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
                            );
                        })}
                    </View>
                </>
            )}

            {isArtist && step === 1 && (
                <View style={styles.artistSection}>
                    <Input
                        label="Nome artístico / projeto"
                        placeholder="Ex: Sussurros da Noite"
                        value={artistName}
                        onChangeText={setArtistName}
                    />
                    <Input
                        label="Handle artístico"
                        placeholder="Ex: @sussurros_noir"
                        value={artistHandle}
                        onChangeText={setArtistHandle}
                    />
                    <Input
                        label="Vibe principal"
                        placeholder="Ex: Jazz Noir"
                        value={artistVibe}
                        onChangeText={setArtistVibe}
                    />

                    <View style={styles.quickRow}>
                        {VIBE_PRESETS.map((vibe) => (
                            <TouchableOpacity key={vibe} style={styles.quickChip} onPress={() => setArtistVibe(vibe)}>
                                <Text style={styles.quickChipText}>{vibe}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { marginTop: 14 }]}>Formação da Entidade</Text>
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
                            );
                        })}
                    </View>
                </View>
            )}

            {isArtist && step === 2 && (
                <View style={styles.artistSection}>
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

                    <Text style={styles.label}>Rider Técnico (Exigências do Palco)</Text>
                    <TextInput
                        style={[styles.textArea, { height: 90 }]}
                        placeholder="Ex: 2 microfones, bateria no local e 3 vias de retorno."
                        placeholderTextColor="#666"
                        multiline
                        value={techRider}
                        onChangeText={setTechRider}
                    />
                    <Text style={styles.helperText}>Isso agiliza contratos e negociações.</Text>
                </View>
            )}

            {userProfile === 'host' && step === 1 && (
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.label}>Em breve configuraremos a sua Taverna...</Text>
                </View>
            )}

            <View style={{ height: 40 }} />

            <View style={styles.navRow}>
                {step > 0 ? (
                    <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
                        <Ionicons name="arrow-back" size={16} color="#EEE" />
                        <Text style={styles.backStepText}>Voltar</Text>
                    </TouchableOpacity>
                ) : <View />}

                <View style={styles.nextBtnWrap}>
                    <Button
                        title={step >= totalSteps - 1 ? 'Finalizar Cadastro' : 'Continuar'}
                        type="primary"
                        onPress={goNext}
                    />
                </View>
            </View>

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
        marginBottom: 18,
        paddingHorizontal: 10,
    },
    stepCard: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        backgroundColor: '#141414',
        padding: 12,
        marginBottom: 16,
    },
    stepHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepLabel: {
        color: '#8B8B8B',
        fontFamily: 'Lato_700Bold',
        fontSize: 11,
    },
    stepTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 14,
    },
    progressTrack: {
        marginTop: 10,
        height: 6,
        borderRadius: 99,
        backgroundColor: '#242424',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
    },
    stepDotsRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepDotWrap: {
        alignItems: 'center',
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#555',
        marginBottom: 5,
    },
    stepDotActive: {
        backgroundColor: THEME.colors.primary,
    },
    stepDotText: {
        color: '#6E6E6E',
        fontSize: 10,
        fontFamily: 'Lato_400Regular',
    },
    stepDotTextActive: {
        color: '#CFCFCF',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarPreview: {
        marginBottom: 8,
    },
    avatarText: {
        color: THEME.colors.primary,
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    },
    subSectionTitle: {
        marginTop: 10,
        color: '#999',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    styleRow: {
        marginTop: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    styleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#111',
    },
    styleChipActive: {
        borderColor: THEME.colors.primary,
        backgroundColor: THEME.colors.primary,
    },
    styleChipText: {
        marginLeft: 6,
        color: '#D0D0D0',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    styleChipTextActive: {
        color: '#000',
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
    },
    quickRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    quickChip: {
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#111',
    },
    quickChipText: {
        color: '#CCC',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    backStepBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    backStepText: {
        color: '#EEE',
        marginLeft: 6,
        fontFamily: 'Lato_700Bold',
    },
    nextBtnWrap: {
        flex: 1,
    }
});