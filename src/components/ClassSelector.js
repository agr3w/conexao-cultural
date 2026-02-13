import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usando ícones vetoriais profissionais
import { THEME } from '../styles/colors'; //

const PROFILES = [
    {
        id: 'artist',
        label: 'O Artista',
        icon: 'musical-notes-outline',
        desc: 'Músicos, Bandas e Performers'
    },
    {
        id: 'host',
        label: 'O Anfitrião',
        icon: 'wine-outline',
        desc: 'Bares, Pubs e Casas de Show'
    },
    {
        id: 'viewer',
        label: 'O Espectador',
        icon: 'eye-outline',
        desc: 'Exploradores de experiências'
    },
];

export default function ClassSelector({ selectedClass, onSelect }) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Qual é a sua Máscara?</Text>

            <View style={styles.row}>
                {PROFILES.map((item) => {
                    const isSelected = selectedClass === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.card,
                                isSelected && styles.cardSelected
                            ]}
                            onPress={() => onSelect(item.id)}
                            activeOpacity={0.8}
                        >
                            {/* Ícone mudando de cor se selecionado */}
                            <Ionicons
                                name={item.icon}
                                size={28}
                                color={isSelected ? THEME.colors.textDark : THEME.colors.primary}
                                style={{ marginBottom: 8 }}
                            />

                            <Text style={[styles.cardTitle, isSelected && styles.textSelected]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Descrição elegante abaixo */}
            <Text style={styles.description}>
                "{PROFILES.find(c => c.id === selectedClass)?.desc}"
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        width: '100%',
    },
    label: {
        fontFamily: 'Cinzel_700Bold', // Fonte mística no título
        color: THEME.colors.primary,
        fontSize: 18,
        marginBottom: 16,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    card: {
        width: '31%', // Ajuste fino para caber 3
        backgroundColor: 'transparent', // Fundo transparente para ficar mais clean
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderRadius: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333', // Borda sutil quando inativo
    },
    cardSelected: {
        backgroundColor: THEME.colors.primary, // Amarelo Rei
        borderColor: THEME.colors.primary,
    },
    cardTitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 11, // Fonte um pouco menor para caber "O Anfitrião"
        color: THEME.colors.text,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    textSelected: {
        color: THEME.colors.textDark, // Preto no Amarelo
    },
    description: {
        fontFamily: 'Cinzel_700Bold', // Usando a fonte do tema para a descrição
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
        fontStyle: 'italic', // Itálico para parecer citação
    }
});