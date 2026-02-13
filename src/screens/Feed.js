import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors'; //
import PostCard from '../components/PostCard';

// Dados Fakes (Mocks) para testar o layout
const POSTS = [
    {
        id: '1',
        author: 'O Bardo Errante',
        handle: '@bardo_errante',
        time: '2h',
        text: 'A procura de uma taverna para tocar alaúde nesta sexta-feira 13. Algum Anfitrião disponível?',
        likes: 12,
        comments: 4,
        image: true // Simula uma imagem
    },
    {
        id: '2',
        author: 'Taverna do Dragão',
        handle: '@dragon_pub',
        time: '4h',
        text: 'Hoje tem hidromel em dobro para quem vier caracterizado! A noite promete ser lendária. 🍺🔥',
        likes: 45,
        comments: 10,
        image: false
    },
    {
        id: '3',
        author: 'Lady Sombria',
        handle: '@lady_dark',
        time: '5h',
        text: 'Alguém sabe onde vai rolar aquele festival de Jazz Noir? Estou perdida no mapa.',
        likes: 8,
        comments: 2,
        image: false
    },
];

export default function Feed() {
    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER FIXO (Topo) */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="menu-outline" size={28} color={THEME.colors.primary} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>O CAOS</Text>

                <TouchableOpacity>
                    <Ionicons name="search-outline" size={24} color={THEME.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* LISTA DE POSTS */}
            <FlatList
                data={POSTS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostCard data={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }} // Espaço para o botão flutuante
            />

            {/* FAB (Floating Action Button) - Botão de Postar */}
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="pencil" size={24} color={THEME.colors.textDark} />
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background, //
        paddingTop: 30, // Para não colar na barra de status do Android
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold', //
        fontSize: 20,
        color: THEME.colors.primary, //
        letterSpacing: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: THEME.colors.primary, //
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    }
});