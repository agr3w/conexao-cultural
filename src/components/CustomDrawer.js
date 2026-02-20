import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import ProfileAvatar from './ProfileAvatar';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CustomDrawer({
    isOpen,
    onClose,
    onNavigate,
    userProfile = 'viewer',
    displayName = 'Viajante do Caos',
    displayHandle = '@viajante_01',
    avatarUrl = '',
    avatarFallbackStyle = 'sigil',
}) {
    const isArtist = userProfile === 'artist';
    const [isVisible, setIsVisible] = useState(isOpen);
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const menuItemsAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 9,
                    tension: 70,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 260,
                    useNativeDriver: true,
                }),
                Animated.timing(menuItemsAnim, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -SCREEN_WIDTH,
                duration: 240,
                useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(menuItemsAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                setIsVisible(false);
            }
        });
    }, [isOpen, slideAnim, backdropAnim, menuItemsAnim]);

    if (!isVisible) return null;

    const backdropStyle = {
        opacity: backdropAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
    };

    const menuItemsStyle = {
        opacity: menuItemsAnim,
        transform: [
            {
                translateY: menuItemsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                }),
            },
        ],
    };

    return (
        <View style={styles.overlay}>
            {/* Fundo escuro transparente para fechar ao tocar fora */}
            <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
            <TouchableOpacity style={styles.backdropTouchArea} onPress={onClose} />

            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

                {/* Header Clicável */}
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => onNavigate('USER_PROFILE')}
                >
                    <ProfileAvatar
                        uri={avatarUrl}
                        name={displayName}
                        variant={avatarFallbackStyle}
                        size={80}
                        borderWidth={2}
                        borderColor={THEME.colors.primary}
                        style={{ marginBottom: 10 }}
                    />
                    <Text style={styles.username}>{displayName}</Text>
                    <Text style={styles.userstatus}>{displayHandle}</Text>
                </TouchableOpacity>

                {/* Itens do Menu */}
                <Animated.View style={[styles.itemsContainer, menuItemsStyle]}>
                    <DrawerItem icon="newspaper-outline" label="O Caos (Feed)" onPress={() => onNavigate('FEED')} />
                    <DrawerItem icon="map-outline" label={isArtist ? 'Radar de Prospecção' : 'Radar (Mapa)'} onPress={() => onNavigate('MAP')} />
                    <DrawerItem icon="calendar-outline" label={isArtist ? 'Contratos Ativos' : 'Rituais (Agenda)'} onPress={() => onNavigate('MY_RITUALS')} />
                    {isArtist && <DrawerItem icon="people-outline" label="Taverna dos Bardos" onPress={() => onNavigate('ARTIST_HUB')} />}
                    {isArtist && <DrawerItem icon="analytics-outline" label="Olho Que Tudo Vê" onPress={() => onNavigate('ARTIST_INSIGHTS')} />}
                    <DrawerItem icon="settings-outline" label="Configurações" onPress={() => onNavigate('SETTINGS')} />
                </Animated.View>

                {/* Botão Sair */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => onNavigate('LOGIN')}>
                    <Ionicons name="log-out-outline" size={24} color="#8A0B0B" />
                    <Text style={styles.logoutText}>Abandonar Pacto</Text>
                </TouchableOpacity>

            </Animated.View>
        </View>
    );
}

// Sub-componente para item do menu
function DrawerItem({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <Ionicons name={icon} size={24} color="#CCC" />
            <Text style={styles.itemText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100, // Fica acima de tudo
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropTouchArea: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '75%', // Ocupa 75% da tela
        backgroundColor: '#121212',
        borderRightWidth: 1,
        borderRightColor: THEME.colors.primary,
        padding: 20,
        paddingTop: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 20,
    },
    username: {
        fontFamily: 'Cinzel_700Bold',
        color: THEME.colors.primary,
        fontSize: 18,
        marginTop: 10,
    },
    userstatus: {
        fontFamily: 'Lato_400Regular',
        color: '#666',
        fontSize: 12,
    },
    itemsContainer: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    itemText: {
        fontFamily: 'Lato_700Bold',
        color: '#EEE',
        marginLeft: 15,
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    logoutText: {
        fontFamily: 'Lato_700Bold',
        color: '#8A0B0B',
        marginLeft: 15,
    }
});