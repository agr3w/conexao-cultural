import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { THEME } from '../styles/colors';

// type pode ser 'primary' (amarelo) ou 'secondary' (borda apenas)
export default function Button({ title, type = 'primary', onPress }) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                type === 'primary' ? styles.primaryButton : styles.secondaryButton
            ]}
            onPress={onPress}
            activeOpacity={0.7} // Efeito visual ao tocar
        >
            <Text style={[
                styles.text,
                type === 'primary' ? styles.primaryText : styles.secondaryText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: THEME.colors.primary, // Amarelo
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: THEME.colors.primary, // Borda Amarela
    },
    text: {
        fontFamily: 'Cinzel_700Bold', // Fonte Mística
        fontSize: 16,
        textTransform: 'uppercase',
    },
    primaryText: {
        color: THEME.colors.textDark, // Texto preto no fundo amarelo
    },
    secondaryText: {
        color: THEME.colors.primary, // Texto amarelo no fundo transparente
    },
});