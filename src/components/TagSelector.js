import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../styles/colors'; //

// Lista de interesses/gêneros (O "Pinterest")
const TAGS = [
    'Rock Clássico', 'Jazz Noir', 'MPB', 'Metal',
    'Teatro', 'Stand-up', 'Acústico', 'Alternativo',
    'Blues', 'Folk', 'Eletrônica', 'Gótico'
];

export default function TagSelector({ selectedTags, onToggle }) {
    return (
        <View style={styles.container}>
            <View style={styles.tagsContainer}>
                {TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <TouchableOpacity
                            key={tag}
                            style={[
                                styles.tag,
                                isSelected && styles.tagSelected
                            ]}
                            onPress={() => onToggle(tag)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.text,
                                isSelected && styles.textSelected
                            ]}>
                                {tag}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8, // Espaçamento entre as tags
    },
    tag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20, // Borda redonda estilo "chip"
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: 'transparent',
        marginBottom: 8,
    },
    tagSelected: {
        backgroundColor: THEME.colors.primary, // Amarelo
        borderColor: THEME.colors.primary,
    },
    text: {
        fontFamily: 'Lato_400Regular', //
        color: '#888',
        fontSize: 14,
    },
    textSelected: {
        color: THEME.colors.textDark, // Preto
        fontFamily: 'Lato_700Bold', //
    }
});