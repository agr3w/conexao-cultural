import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../styles/colors'; //
import Input from '../components/Input';
import Button from '../components/Button';
import ClassSelector from '../components/ClassSelector';
import TagSelector from '../components/TagSelector';

export default function SignUp({ onBack }) {
    // Estado inicial agora é 'viewer' (Espectador)
    const [userProfile, setUserProfile] = useState('viewer');
    const [selectedTags, setSelectedTags] = useState([]);

    function toggleTag(tag) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Título mais misterioso */}
            <Text style={styles.title}>Una-se ao Culto</Text>
            <Text style={styles.subtitle}>Crie seu perfil no Conexão Cultural</Text>

            {/* 1. O novo Seletor de Máscaras */}
            <ClassSelector selectedClass={userProfile} onSelect={setUserProfile} />

            {/* 2. Formulário */}
            <View style={styles.form}>
                <Input
                    label="Nome no Registro"
                    placeholder="Nome Completo"
                />
                <Input
                    label="Codinome"
                    placeholder="Seu Usuário / @Arroba"
                />
                <Input
                    label="Contato Sombrio"
                    placeholder="Seu E-mail"
                />
                <Input
                    label="Chave de Acesso"
                    placeholder="Senha"
                    secureTextEntry
                />

                {/* Lógica condicional atualizada */}
                {userProfile === 'host' && (
                    <View>
                        <Input label="Nome do Local" placeholder="Ex: Yellow King Pub" />
                        <Input label="Capacidade" placeholder="Quantas almas cabem?" keyboardType="numeric" />
                    </View>
                )}

                {userProfile === 'artist' && (
                    <View>
                        <Input label="Gênero da Arte" placeholder="Ex: Rock Psicodélico, Jazz Noir..." />
                        <Input label="Link do Portfólio" placeholder="Spotify, YouTube ou Instagram" />
                    </View>
                )}

                <View style={{ marginTop: 24, marginBottom: 16 }}>

                    {/* Título Dinâmico baseado na Máscara */}
                    <Text style={styles.sectionTitle}>
                        {userProfile === 'viewer' && "O que sua alma busca?"}
                        {userProfile === 'artist' && "Defina sua Arte"}
                        {userProfile === 'host' && "O que toca no seu local?"}
                    </Text>

                    <TagSelector selectedTags={selectedTags} onToggle={toggleTag} />
                </View>

                <View style={{ height: 20 }} />

                <Button
                    title="Firmar Pacto"
                    type="primary"
                    onPress={() => alert(`Cadastrando perfil: ${userProfile}`)}
                />

                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.link}>Já possui um pacto? Entrar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: THEME.colors.background, //
    },
    title: {
        fontFamily: 'Cinzel_700Bold', //
        fontSize: 28,
        color: THEME.colors.primary, //
        textAlign: 'center',
        marginTop: 40,
    },
    subtitle: {
        fontFamily: 'Lato_400Regular', //
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
    },
    form: {
        width: '100%',
    },
    link: {
        color: THEME.colors.text, //
        textAlign: 'center',
        marginTop: 16,
        textDecorationLine: 'underline',
        fontFamily: 'Lato_400Regular', //
    }
});