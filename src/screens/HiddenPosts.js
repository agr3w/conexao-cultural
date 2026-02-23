import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { getHiddenPostsByOwner, restoreHiddenPostForOwner } from '../service/feedPosts';

function HiddenPostCard({ post, onRestore }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.cardBadge}>
                    <Ionicons name="eye-off-outline" size={14} color={THEME.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{post.title || post.author}</Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>{post.author} {post.handle ? `• ${post.handle}` : ''}</Text>
                </View>
            </View>

            <Text style={styles.cardText} numberOfLines={2}>{post.text || 'Sem descrição.'}</Text>

            <TouchableOpacity style={styles.restoreButton} onPress={() => onRestore(post.id)}>
                <Ionicons name="eye-outline" size={15} color="#000" />
                <Text style={styles.restoreText}>Reexibir no feed</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function HiddenPosts({ ownerUserId, refreshTick = 0, onBack, onChanged }) {
    const hiddenPosts = useMemo(
        () => getHiddenPostsByOwner(ownerUserId),
        [ownerUserId, refreshTick]
    );

    const handleRestore = (postId) => {
        try {
            const restored = restoreHiddenPostForOwner(postId, ownerUserId);
            if (!restored) {
                alert('Este post já foi reexibido.');
                return;
            }

            onChanged?.();
            alert('Post reexibido no feed.');
        } catch (error) {
            alert(error?.message || 'Não foi possível reexibir este post.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Posts ocultados</Text>
            </View>

            <FlatList
                data={hiddenPosts}
                keyExtractor={(item) => `hidden_${item.id}`}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => <HiddenPostCard post={item} onRestore={handleRestore} />}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum post ocultado por enquanto.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backBtn: {
        marginRight: 12,
    },
    headerTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 21,
    },
    listContent: {
        padding: 16,
        paddingBottom: 26,
    },
    card: {
        borderWidth: 1,
        borderColor: '#2F2F2F',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#151515',
        marginBottom: 10,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#3A3A3A',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardTitle: {
        color: '#E4E4E4',
        fontFamily: 'Lato_700Bold',
        fontSize: 13,
    },
    cardMeta: {
        marginTop: 2,
        color: '#8B8B8B',
        fontFamily: 'Lato_400Regular',
        fontSize: 11,
    },
    cardText: {
        marginTop: 10,
        color: '#BEBEBE',
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
        lineHeight: 18,
    },
    restoreButton: {
        marginTop: 12,
        borderRadius: 8,
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    restoreText: {
        color: '#000',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    emptyText: {
        color: '#777',
        fontFamily: 'Lato_400Regular',
        textAlign: 'center',
        marginTop: 30,
    },
});
