import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { THEME } from '../styles/colors';

// type pode ser 'primary' (amarelo) ou 'secondary' (borda apenas)
export default function Button({ title, type = 'primary', onPress }) {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(pressAnim, {
            toValue: 0.97,
            friction: 8,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(pressAnim, {
            toValue: 1,
            friction: 7,
            tension: 110,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <TouchableOpacity
                style={[
                    styles.button,
                    type === 'primary' ? styles.primaryButton : styles.secondaryButton
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                <Text style={[
                    styles.text,
                    type === 'primary' ? styles.primaryText : styles.secondaryText
                ]}>
                    {title}
                </Text>
            </TouchableOpacity>
        </Animated.View>
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