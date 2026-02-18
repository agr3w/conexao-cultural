import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CustomDrawer({ isOpen, onClose, onNavigate }) {
    const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isOpen ? 0 : -SCREEN_WIDTH,
            duration: 300,
            useNativeDriver: true, // Use false se der erro no layout
        }).start();
    }, [isOpen]);

    if (!isOpen) return null; // Não renderiza se fechado (opcional, pode manter renderizado off-screen)

    return (
        <View style={[styles.overlay, !isOpen && { width: 0 }]}>
            {/* Fundo escuro transparente para fechar ao tocar fora */}
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />

            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

                {/* Header Clicável */}
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => onNavigate('USER_PROFILE')}
                >
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#333',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                        borderWidth: 2,
                        borderColor: THEME.colors.primary,
                    }}>
                        <Ionicons name="person" size={40} color={THEME.colors.primary} />
                    </View>
                    <Text style={styles.username}>Viajante do Caos</Text>
                    <Text style={styles.userstatus}>Ver Grimório Pessoal</Text>
                </TouchableOpacity>

                {/* Itens do Menu */}
                <View style={styles.itemsContainer}>
                    <DrawerItem icon="newspaper-outline" label="O Caos (Feed)" onPress={() => onNavigate('FEED')} />
                    <DrawerItem icon="map-outline" label="Radar (Mapa)" onPress={() => onNavigate('MAP')} />
                    <DrawerItem icon="calendar-outline" label="Rituais (Agenda)" onPress={() => onNavigate('MY_RITUALS')} />
                    <DrawerItem icon="settings-outline" label="Configurações" onPress={() => alert('Config')} />
                </View>

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
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
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