import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { THEME } from '../styles/colors'; //
import Input from '../components/Input';
import Button from '../components/Button';
import ClassSelector from '../components/ClassSelector';

export default function SignUp({ onBack, onNext }) {
    const [userProfile, setUserProfile] = useState('viewer');
    const [fullName, setFullName] = useState('');
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [artistGenre, setArtistGenre] = useState('');
    const [artistPortfolio, setArtistPortfolio] = useState('');

    return (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Título mais misterioso */}
            <Text style={styles.title}>Una-se ao Culto</Text>
            <Text style={styles.subtitle}>Crie seu perfil no Conexão Cultural</Text>

            {/* 1. O novo Seletor de Máscaras */}
            <ClassSelector selectedClass={userProfile} onSelect={setUserProfile} />

            {/* 2. Formulário */}
            <View style={styles.form}>
                <Input label="Nome no Registro" placeholder="Nome Completo" value={fullName} onChangeText={setFullName} />
                <Input label="Codinome" placeholder="Seu Usuário / @Arroba" value={handle} onChangeText={setHandle} autoCapitalize="none" />
                <Input label="Contato Sombrio" placeholder="Seu E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                <Input label="Chave de Acesso" placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />

                {userProfile === 'artist' && (
                    <View>
                        <Input label="Gênero da Arte" placeholder="Ex: Rock Psicodélico, Jazz Noir..." value={artistGenre} onChangeText={setArtistGenre} />
                        <Input label="Link do Portfólio" placeholder="Spotify, YouTube ou Instagram" value={artistPortfolio} onChangeText={setArtistPortfolio} autoCapitalize="none" />
                    </View>
                )}

                <View style={{ height: 20 }} />

                <Button
                    title="Firmar Pacto"
                    type="primary"
                    onPress={() =>
                        onNext({
                            userProfile,
                            account: { fullName, handle, email, password },
                            artistSeed: { genre: artistGenre, portfolio: artistPortfolio },
                        })
                    }
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