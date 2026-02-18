import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors'; //

export default function Settings({ onBack, onLogout }) {
    const [notifications, setNotifications] = useState(true);
    const [location, setLocation] = useState(true);

    // Componente de Item de Configuração (Linha)
    const SettingItem = ({ icon, label, type = 'arrow', value, onToggle }) => (
        <TouchableOpacity
            style={styles.item}
            activeOpacity={type === 'switch' ? 1 : 0.7}
            onPress={type === 'arrow' ? () => alert('Em breve...') : onToggle}
        >
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={THEME.colors.primary} />
                </View>
                <Text style={styles.itemLabel}>{label}</Text>
            </View>

            {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#666" />}

            {type === 'switch' && (
                <Switch
                    trackColor={{ false: "#333", true: THEME.colors.primary }}
                    thumbColor={value ? "#000" : "#f4f3f4"}
                    onValueChange={onToggle}
                    value={value}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>O Códice</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* SEÇÃO 1: A LENDA (Perfil) */}
                <Text style={styles.sectionTitle}>Sua Lenda</Text>
                <View style={styles.sectionCard}>
                    <SettingItem icon="person-outline" label="Reescrever História (Editar Perfil)" />
                    <SettingItem icon="key-outline" label="Alterar Palavra-Passe (Senha)" />
                    <SettingItem icon="wallet-outline" label="Métodos de Pagamento" />
                </View>

                {/* SEÇÃO 2: RITUAIS (Preferências) */}
                <Text style={styles.sectionTitle}>Preferências do Ritual</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        type="switch"
                        icon="notifications-outline"
                        label="Corvos Mensageiros (Notificações)"
                        value={notifications}
                        onToggle={() => setNotifications(!notifications)}
                    />
                    <SettingItem
                        type="switch"
                        icon="location-outline"
                        label="Rastrear Presença (GPS)"
                        value={location}
                        onToggle={() => setLocation(!location)}
                    />
                    <SettingItem icon="moon-outline" label="Tema (Sempre Escuro)" />
                </View>

                {/* SEÇÃO 3: SUPORTE */}
                <Text style={styles.sectionTitle}>O Conselho</Text>
                <View style={styles.sectionCard}>
                    <SettingItem icon="help-buoy-outline" label="Invocar Ajuda (Suporte)" />
                    <SettingItem icon="document-text-outline" label="Pergaminhos da Lei (Termos)" />
                    <SettingItem icon="star-outline" label="Avaliar o Portal" />
                </View>

                {/* BOTÃO DE SAIR (PERIGO) */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Ionicons name="power" size={20} color="#8A0B0B" />
                    <Text style={styles.logoutText}>Quebrar o Pacto (Sair)</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versão 0.6.6 (Beta)</Text>

            </ScrollView>
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
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 15,
    },
    backBtn: {
        marginRight: 15,
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 24,
        color: THEME.colors.text,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontFamily: 'Cinzel_700Bold', //
        color: THEME.colors.primary,
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10,
        paddingLeft: 4,
    },
    sectionCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 200, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemLabel: {
        fontFamily: 'Lato_400Regular', //
        color: '#DDD',
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(138, 11, 11, 0.1)',
        borderWidth: 1,
        borderColor: '#8A0B0B',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
    },
    logoutText: {
        color: '#8A0B0B', // Sangue
        fontFamily: 'Lato_700Bold', //
        fontSize: 16,
        marginLeft: 8,
    },
    versionText: {
        textAlign: 'center',
        color: '#444',
        marginTop: 20,
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    }
});