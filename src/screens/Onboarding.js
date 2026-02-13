import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120; // Quanto precisa arrastar para contar

// Interesses para "julgar"
const CARDS = [
    { id: '1', label: 'Rock Clássico', icon: 'musical-notes' },
    { id: '2', label: 'Jazz Noir', icon: 'moon' },
    { id: '3', label: 'Teatro', icon: 'people' },
    { id: '4', label: 'Stand-up', icon: 'mic' },
    { id: '5', label: 'MPB', icon: 'leaf' },
    { id: '6', label: 'Metal', icon: 'flash' },
];

export default function Onboarding({ userProfile, onFinish }) {
    // Controle de quais cartas já foram
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedTags, setLikedTags] = useState([]);

    // Animação (Posição da carta)
    const position = useRef(new Animated.ValueXY()).current;

    // O "Gesto" de arrastar
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    forceSwipe('left');
                } else {
                    resetPosition();
                }
            }
        })
    ).current;

    // Funções de Animação
    const forceSwipe = (direction) => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction) => {
        const item = CARDS[currentIndex];

        // Se foi pra direita, adiciona aos likes
        if (direction === 'right') {
            setLikedTags(prev => [...prev, item.label]);
        }

        position.setValue({ x: 0, y: 0 });
        setCurrentIndex(prev => prev + 1);
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
        }).start();
    };

    // Interpolações para girar e mudar cor
    const rotate = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp'
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [0, SCREEN_WIDTH / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 4, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    // Renderiza a carta atual
    const renderCard = () => {
        if (currentIndex >= CARDS.length) {
            return (
                <View style={styles.container}>
                    <Ionicons name="checkmark-circle" size={80} color={THEME.colors.primary} />
                    <Text style={styles.title}>Ritual Completo</Text>
                    <Text style={styles.subtitle}>Você selecionou {likedTags.length} interesses.</Text>
                    <View style={{ width: '100%', marginTop: 20 }}>
                        <Button title="Entrar no Caos" onPress={() => onFinish(likedTags)} />
                    </View>
                </View>
            );
        }

        const item = CARDS[currentIndex];

        return (
            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.card,
                    { transform: [{ rotate }, ...position.getTranslateTransform()] }
                ]}
            >
                {/* Carimbo de LIKE (Direita) */}
                <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]}>
                    <Text style={styles.likeText}>QUERO</Text>
                </Animated.View>

                {/* Carimbo de NOPE (Esquerda) */}
                <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOpacity }]}>
                    <Text style={styles.nopeText}>PASSO</Text>
                </Animated.View>

                <Ionicons name={item.icon} size={80} color={THEME.colors.primary} />
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>
                    {userProfile === 'artist' ? 'Eu toco isso' : 'Tenho interesse'}
                </Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>
                {userProfile === 'artist' ? "Defina sua Arte" : "O que você busca?"}
            </Text>
            <Text style={styles.hint}>Deslize: Direita (Sim) / Esquerda (Não)</Text>

            <View style={styles.cardContainer}>
                {renderCard()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 24,
        color: THEME.colors.text,
        marginBottom: 10,
        marginTop: 40,
    },
    hint: {
        fontFamily: 'Lato_400Regular',
        color: '#666',
        marginBottom: 20,
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        height: 400,
        width: 300,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        // Sombra
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
        elevation: 11,
    },
    cardTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: THEME.colors.text,
        marginTop: 20,
    },
    cardSubtitle: {
        fontFamily: 'Lato_400Regular',
        color: '#888',
        marginTop: 10,
    },
    title: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: THEME.colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        color: '#ccc',
        marginBottom: 30,
    },
    // Estilos dos carimbos (Stamps)
    stamp: {
        position: 'absolute',
        top: 40,
        borderWidth: 4,
        borderRadius: 10,
        padding: 10,
        transform: [{ rotate: '-15deg' }],
        zIndex: 10,
    },
    likeStamp: {
        left: 40,
        borderColor: THEME.colors.primary,
    },
    nopeStamp: {
        right: 40,
        borderColor: THEME.colors.error,
        transform: [{ rotate: '15deg' }],
    },
    likeText: {
        color: THEME.colors.primary,
        fontSize: 32,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    nopeText: {
        color: THEME.colors.error,
        fontSize: 32,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});