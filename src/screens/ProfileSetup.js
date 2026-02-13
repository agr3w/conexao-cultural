import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors'; //
import Button from '../components/Button';
import Input from '../components/Input';

const INTENTIONS = [
    { id: 'solo', label: 'Jornada Solo', icon: 'person' },
    { id: 'date', label: 'Encontro Romântico', icon: 'heart' },
    { id: 'friends', label: 'Role', icon: 'people' },
    { id: 'business', label: 'Networking', icon: 'briefcase' },
];

export default function ProfileSetup({ userProfile, onFinish }) {
    const [intention, setIntention] = useState('solo');
    const [bio, setBio] = useState('');

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.headerTitle}>Sua Identidade</Text>
            <Text style={styles.subtitle}>Como você quer ser visto no Caos?</Text>

            {/* 1. AVATAR (Simulação) */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color={THEME.colors.primary} />
                </View>
                <Text style={styles.avatarText}>Adicionar Retrato</Text>
            </View>

            {/* 2. CAMPOS DE TEXTO */}
            <View style={styles.form}>
                <Input
                    label="Sua Base"
                    placeholder="Qual sua cidade?"
                />

                {/* Input customizado para Bio (Multilinha) */}
                <Text style={styles.label}>Sua História (Bio)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Conte brevemente quem é você e o que te move..."
                    placeholderTextColor="#666"
                    multiline
                    numberOfLines={4}
                    value={bio}
                    onChangeText={setBio}
                />
            </View>

            {/* 3. SELETOR DE INTENÇÃO (O que busca?) */}
            <Text style={[styles.label, { marginTop: 20, textAlign: 'center' }]}>
                Qual seu objetivo principal?
            </Text>

            <View style={styles.intentionsRow}>
                {INTENTIONS.map((item) => {
                    const isSelected = intention === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.intentionCard, isSelected && styles.intentionSelected]}
                            onPress={() => setIntention(item.id)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={24}
                                color={isSelected ? THEME.colors.textDark : '#888'}
                            />
                            <Text style={[styles.intentionText, isSelected && styles.textSelected]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <View style={{ height: 30 }} />

            <Button
                title="Assinar o Pacto (Finalizar)"
                type="primary"
                onPress={onFinish}
            />

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: THEME.colors.background, //
        padding: 24,
        paddingTop: 60,
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: THEME.colors.primary, //
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
    },
    // Avatar Styles
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        color: THEME.colors.primary,
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    },
    // Form Styles
    form: {
        width: '100%',
    },
    label: {
        fontFamily: 'Lato_700Bold',
        color: THEME.colors.primary,
        marginBottom: 8,
        fontSize: 14,
    },
    textArea: {
        backgroundColor: THEME.colors.secondary, //
        color: THEME.colors.text,
        fontFamily: 'Lato_400Regular',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top', // Para o texto começar em cima no Android
    },
    // Intention Styles
    intentionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    intentionCard: {
        width: '48%',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    intentionSelected: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    intentionText: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Lato_700Bold',
        textAlign: 'center',
    },
    textSelected: {
        color: THEME.colors.textDark,
    }
});