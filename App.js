import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { THEME } from './src/styles/colors';

import Input from './src/components/Input';
import Button from './src/components/Button';
import SignUp from './src/screens/SignUp';
import Onboarding from './src/screens/Onboarding';
import ProfileSetup from './src/screens/ProfileSetup';

// --- VERIFIQUE ESTES CAMINHOS ---
import Feed from './src/screens/Feed'; 
import MapScreen from './src/screens/MapScreen';
import CustomDrawer from './src/components/CustomDrawer'; 

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [tempProfile, setTempProfile] = useState('viewer');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  // Função para navegar pelo Menu
  const navigateFromMenu = (screen) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false); // Fecha o menu ao clicar
  };

  // --- 1. TELAS DE AUTENTICAÇÃO (SEM MENU) ---

  if (currentScreen === 'SIGNUP') {
    return (
      <SignUp
        onBack={() => setCurrentScreen('LOGIN')}
        onNext={(profile) => {
          setTempProfile(profile);
          setCurrentScreen('ONBOARDING');
        }}
      />
    );
  }

  if (currentScreen === 'ONBOARDING') {
    return (
      <Onboarding
        userProfile={tempProfile}
        onFinish={(tags) => {
          console.log("Tags:", tags);
          setCurrentScreen('PROFILE_SETUP');
        }}
      />
    );
  }

  if (currentScreen === 'PROFILE_SETUP') {
    return (
      <ProfileSetup
        userProfile={tempProfile}
        onFinish={() => {
          setCurrentScreen('FEED');
        }}
      />
    );
  }

  if (currentScreen === 'LOGIN') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <StatusBar style="light" />

        <View style={styles.header}>
          <Text style={{ fontSize: 60 }}>👁️</Text>
          <Text style={styles.title}>CONEXÃO{'\n'}CULTURAL</Text>
          <Text style={styles.subtitle}>Onde o caos encontra a arte</Text>
        </View>

        <View style={styles.form}>
          <Input label="Codinome" placeholder="Digite seu e-mail" />
          <Input label="Palavra-chave" placeholder="Digite sua senha" secureTextEntry />

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Esqueceu suas credenciais?</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          <Button
            title="Entrar no Portal"
            type="primary"
            onPress={() => setCurrentScreen('FEED')}
          />

          <Button
            title="Criar novo Pacto"
            type="secondary"
            onPress={() => setCurrentScreen('SIGNUP')}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  // --- 2. TELAS PRINCIPAIS (COM MENU) ---

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <StatusBar style="light" />

      {/* RENDERIZA A TELA ATUAL */}
      {currentScreen === 'FEED' && <Feed />}

      {currentScreen === 'MAP' && <MapScreen />}

      {/* COMPONENTE DE MENU (DRAWER) - Fica por cima de tudo */}
      {/* Verifica se o componente existe antes de renderizar para evitar crash se estiver faltando */}
      {CustomDrawer && (
        <CustomDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onNavigate={navigateFromMenu}
        />
      )}

      {/* Botão de Menu Flutuante Global */}
      {(currentScreen === 'FEED' || currentScreen === 'MAP') && (
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 10, width: 60, height: 60, zIndex: 50, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setIsMenuOpen(true)}
        >
          {/* Área de toque invisível sobre o ícone de menu */}
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 32,
    color: THEME.colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Lato_400Regular',
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    color: '#666',
    textAlign: 'right',
    fontFamily: 'Lato_400Regular',
    marginBottom: 24,
  }
});