import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors'; //

export default function PostCard({ data }) {
    return (
        <View style={styles.container}>

            {/* CABEÇALHO DO POST */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {/* Placeholder de Avatar se não tiver imagem */}
                    <Ionicons name="person" size={20} color={THEME.colors.background} />
                </View>
                <View>
                    <Text style={styles.name}>{data.author}</Text>
                    <Text style={styles.handle}>{data.handle} • {data.time}</Text>
                </View>
                <TouchableOpacity style={styles.moreIcon}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* CONTEÚDO */}
            <Text style={styles.content}>{data.text}</Text>

            {/* Se tiver imagem no post (simulação) */}
            {data.image && (
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#333" />
                    <Text style={{ color: '#333', marginTop: 8 }}>Imagem do Evento</Text>
                </View>
            )}

            {/* RODAPÉ (AÇÕES MÍSTICAS) */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="heart-outline" size={20} color="#888" />
                    <Text style={styles.actionText}>{data.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#888" />
                    <Text style={styles.actionText}>{data.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-social-outline" size={20} color="#888" />
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222', // Divisória sutil
        backgroundColor: THEME.colors.background, //
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.primary, //
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    name: {
        fontFamily: 'Cinzel_700Bold', //
        color: THEME.colors.primary, //
        fontSize: 16,
    },
    handle: {
        fontFamily: 'Lato_400Regular', //
        color: '#666',
        fontSize: 12,
    },
    moreIcon: {
        marginLeft: 'auto',
    },
    content: {
        fontFamily: 'Lato_400Regular', //
        color: THEME.colors.text, //
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#333'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 40,
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: '#888',
        marginLeft: 6,
        fontSize: 12,
        fontFamily: 'Lato_400Regular', //
    }
});