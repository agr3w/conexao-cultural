import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { THEME } from '../styles/colors'; // Importando nossas cores

export default function Input({ label, placeholder, secureTextEntry }) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#666" // Um cinza para o placeholder não ofuscar
                secureTextEntry={secureTextEntry} // Para esconder a senha
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontFamily: 'Lato_700Bold',
        color: THEME.colors.primary, // Rótulo em Amarelo
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: THEME.colors.secondary, // Fundo cinza escuro
        color: THEME.colors.text, // Texto branco gelo
        fontFamily: 'Lato_400Regular',
        padding: 16,
        borderRadius: 8, // Bordas levemente arredondadas
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 16,
    },
});