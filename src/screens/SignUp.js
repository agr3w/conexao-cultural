import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { THEME } from '../styles/colors'; //
import Input from '../components/Input';
import Button from '../components/Button';
import ClassSelector from '../components/ClassSelector';

const GENRE_PRESETS = ['Rock', 'Pop', 'MPB', 'Jazz Noir', 'Eletrônico'];

function normalizeHandle(raw = '') {
    const base = String(raw || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    return base ? `@${base}` : '';
}

function buildHandleSuggestion(name = '') {
    const cleaned = String(name || '').trim();
    if (!cleaned) return '@viajante_do_caos';

    const parts = cleaned
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .filter(Boolean);

    const first = parts[0] || 'viajante';
    const second = parts[1] || 'caos';
    return normalizeHandle(`${first}_${second}`);
}

function getPasswordScore(password = '') {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
}

function getPasswordLabel(score) {
    if (score <= 1) return { label: 'Fraca', color: '#8A0B0B' };
    if (score === 2) return { label: 'Média', color: '#B8860B' };
    if (score === 3) return { label: 'Boa', color: '#5C8A0B' };
    return { label: 'Forte', color: '#2E8B57' };
}

export default function SignUp({ onBack, onNext }) {
    const [userProfile, setUserProfile] = useState('viewer');
    const [fullName, setFullName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [artistGenre, setArtistGenre] = useState('');
    const [artistPortfolio, setArtistPortfolio] = useState('');
    const [step, setStep] = useState(0);
    const [progressTrackWidth, setProgressTrackWidth] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const steps = useMemo(
        () => (userProfile === 'artist' ? ['Máscara', 'Identidade', 'Selo Artístico', 'Segurança'] : ['Máscara', 'Identidade', 'Segurança']),
        [userProfile]
    );

    const totalSteps = steps.length;
    const passwordScore = getPasswordScore(password);
    const passwordMeta = getPasswordLabel(passwordScore);

    const handleSuggestion = useMemo(() => buildHandleSuggestion(fullName), [fullName]);

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(16);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 240,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [step, userProfile, fadeAnim, slideAnim]);

    const animatedStepStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
    };

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

    const canContinue = useMemo(() => {
        if (step === 0) return Boolean(userProfile);
        if (step === 1) return fullName.trim().length >= 2 && handle.trim().length >= 3 && email.includes('@');
        if (userProfile === 'artist' && step === 2) return artistGenre.trim().length >= 2;
        if (step === totalSteps - 1) return passwordScore >= 2;
        return true;
    }, [step, userProfile, fullName, handle, email, artistGenre, totalSteps, passwordScore]);

    const submit = () => {
        onNext({
            userProfile,
            account: { fullName, handle, email, password },
            artistSeed: { genre: artistGenre, portfolio: artistPortfolio },
        });
    };

    const goNext = () => {
        if (!canContinue) {
            alert('Preencha os campos essenciais desta etapa para avançar.');
            return;
        }

        if (step >= totalSteps - 1) {
            submit();
            return;
        }

        setStep((prev) => prev + 1);
    };

    const goBackStep = () => {
        if (step === 0) {
            onBack?.();
            return;
        }
        setStep((prev) => prev - 1);
    };

    return (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Título mais misterioso */}
            <Text style={styles.title}>Una-se ao Culto</Text>
            <Text style={styles.subtitle}>Crie seu perfil no Conexão Cultural</Text>

            <View style={styles.progressCard}>
                <View style={styles.progressHead}>
                    <Text style={styles.progressStep}>Etapa {step + 1} de {totalSteps}</Text>
                    <Text style={styles.progressTitle}>{steps[step]}</Text>
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
            </View>

            {step === 0 && (
                <Animated.View style={animatedStepStyle}>
                    <ClassSelector selectedClass={userProfile} onSelect={setUserProfile} />
                    <View style={styles.tipBox}>
                        <Text style={styles.tipTitle}>Dica Rápida</Text>
                        <Text style={styles.tipText}>
                            {userProfile === 'artist'
                                ? 'Perfil artista desbloqueia chamados, comunidade e insights.'
                                : 'Perfil público é ideal para explorar eventos e conectar com artistas.'}
                        </Text>
                    </View>
                </Animated.View>
            )}

            <View style={styles.form}>
                {step === 1 && (
                    <Animated.View style={animatedStepStyle}>
                        <Input label="Nome no Registro" placeholder="Nome Completo" value={fullName} onChangeText={setFullName} />
                        <Input
                            label="Codinome"
                            placeholder="Seu usuário / @arroba"
                            value={handle}
                            onChangeText={(value) => setHandle(normalizeHandle(value) || value)}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setHandle(handleSuggestion)}>
                            <Text style={styles.quickActionText}>Sugerir codinome: {handleSuggestion}</Text>
                        </TouchableOpacity>
                        <Input
                            label="Contato Sombrio"
                            placeholder="Seu e-mail"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </Animated.View>
                )}

                {userProfile === 'artist' && step === 2 && (
                    <Animated.View style={animatedStepStyle}>
                        <Input
                            label="Gênero da Arte"
                            placeholder="Ex: Rock Psicodélico, Jazz Noir..."
                            value={artistGenre}
                            onChangeText={setArtistGenre}
                        />
                        <View style={styles.genreWrap}>
                            {GENRE_PRESETS.map((genre) => {
                                const active = artistGenre.toLowerCase() === genre.toLowerCase();
                                return (
                                    <TouchableOpacity
                                        key={genre}
                                        style={[styles.genreChip, active && styles.genreChipActive]}
                                        onPress={() => setArtistGenre(genre)}
                                    >
                                        <Text style={[styles.genreChipText, active && styles.genreChipTextActive]}>{genre}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Input
                            label="Link do Portfólio"
                            placeholder="Spotify, YouTube ou Instagram"
                            value={artistPortfolio}
                            onChangeText={setArtistPortfolio}
                            autoCapitalize="none"
                        />
                    </Animated.View>
                )}

                {step === totalSteps - 1 && (
                    <Animated.View style={animatedStepStyle}>
                        <Input
                            label="Chave de Acesso"
                            placeholder="Senha"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.strengthCard}>
                            <Text style={styles.strengthLabel}>Força da senha: <Text style={{ color: passwordMeta.color }}>{passwordMeta.label}</Text></Text>
                            <View style={styles.strengthTrack}>
                                <View style={[styles.strengthFill, { width: `${(passwordScore / 4) * 100}%`, backgroundColor: passwordMeta.color }]} />
                            </View>
                        </View>

                        <View style={styles.reviewCard}>
                            <Text style={styles.reviewTitle}>Resumo do Pacto</Text>
                            <Text style={styles.reviewLine}>Perfil: {userProfile === 'artist' ? 'Artista' : 'Público'}</Text>
                            <Text style={styles.reviewLine}>Nome: {fullName || '—'}</Text>
                            <Text style={styles.reviewLine}>Codinome: {handle || '—'}</Text>
                            {!!artistGenre && <Text style={styles.reviewLine}>Vibe: {artistGenre}</Text>}
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 18 }} />

                <View style={styles.navRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={goBackStep}>
                        <Text style={styles.backBtnText}>{step === 0 ? 'Voltar ao login' : 'Voltar etapa'}</Text>
                    </TouchableOpacity>
                    <View style={styles.nextWrap}>
                        <Button
                            title={step === totalSteps - 1 ? 'Firmar Pacto' : 'Continuar'}
                            type="primary"
                            onPress={goNext}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: THEME.colors.background, //
    },
    title: {
        fontFamily: 'Cinzel_700Bold', //
        fontSize: 28,
        color: THEME.colors.primary, //
        textAlign: 'center',
        marginTop: 40,
    },
    subtitle: {
        fontFamily: 'Lato_400Regular', //
        color: '#888',
        textAlign: 'center',
        marginBottom: 16,
    },
    progressCard: {
        borderWidth: 1,
        borderColor: '#343434',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#151515',
        marginBottom: 16,
    },
    progressHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressStep: {
        color: '#878787',
        fontFamily: 'Lato_700Bold',
        fontSize: 11,
    },
    progressTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 13,
    },
    progressTrack: {
        marginTop: 8,
        height: 6,
        borderRadius: 999,
        backgroundColor: '#2A2A2A',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
    },
    tipBox: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#343434',
        borderRadius: 10,
        backgroundColor: '#141414',
        padding: 10,
        marginBottom: 8,
    },
    tipTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
        marginBottom: 4,
    },
    tipText: {
        color: '#AFAFAF',
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    },
    form: {
        width: '100%',
    },
    quickActionBtn: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 14,
        backgroundColor: '#111',
    },
    quickActionText: {
        color: '#D0D0D0',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    genreWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
        marginTop: -4,
    },
    genreChip: {
        borderWidth: 1,
        borderColor: '#3A3A3A',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#111',
    },
    genreChipActive: {
        borderColor: THEME.colors.primary,
        backgroundColor: THEME.colors.primary,
    },
    genreChipText: {
        color: '#D0D0D0',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    genreChipTextActive: {
        color: '#000',
    },
    strengthCard: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        backgroundColor: '#151515',
        padding: 10,
        marginBottom: 10,
    },
    strengthLabel: {
        color: '#CFCFCF',
        fontFamily: 'Lato_700Bold',
        marginBottom: 8,
        fontSize: 12,
    },
    strengthTrack: {
        height: 6,
        borderRadius: 999,
        backgroundColor: '#2A2A2A',
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        backgroundColor: '#141414',
        padding: 10,
        marginBottom: 6,
    },
    reviewTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 13,
        marginBottom: 6,
    },
    reviewLine: {
        color: '#C7C7C7',
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
        marginBottom: 2,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backBtn: {
        borderWidth: 1,
        borderColor: '#555',
        borderRadius: 8,
        paddingVertical: 11,
        paddingHorizontal: 12,
    },
    backBtnText: {
        color: '#DDD',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    nextWrap: {
        flex: 1,
    },
    link: {
        color: THEME.colors.text, //
        textAlign: 'center',
        marginTop: 16,
        textDecorationLine: 'underline',
        fontFamily: 'Lato_400Regular', //
    }
});