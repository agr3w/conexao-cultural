import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { THEME } from './src/styles/colors';

// Importe seus componentes
import Input from './src/components/Input';
import Button from './src/components/Button';
import SignUp from './src/screens/SignUp';
import Onboarding from './src/screens/Onboarding'; // Importe a nova tela

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [tempProfile, setTempProfile] = useState('viewer'); // Guarda o perfil escolhido

  let [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  // --- FLUXO DE TELAS ---

  // 1. TELA DE CADASTRO
  if (currentScreen === 'SIGNUP') {
    return (
      <SignUp
        onBack={() => setCurrentScreen('LOGIN')}
        onNext={(profile) => {
          setTempProfile(profile); // Salva quem ele é (Bardo, Anfitrião...)
          setCurrentScreen('ONBOARDING'); // Manda pro Tinder cultural
        }}
      />
    );
  }

  // 2. TELA DE ONBOARDING (NOVA)
  if (currentScreen === 'ONBOARDING') {
    return (
      <Onboarding
        userProfile={tempProfile}
        onFinish={(tags) => {
          console.log("Interesses escolhidos:", tags);
          alert("Bem-vindo ao Conexão Cultural!");
          setCurrentScreen('LOGIN'); // Ou Home no futuro
        }}
      />
    );
  }

  // 3. TELA DE LOGIN (Padrão)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        {/* Simulação do ícone já que não instalamos vector-icons ainda */}
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
          onPress={() => alert('Entrando...')}
        />

        {/* BOTÃO QUE LEVA PRO CADASTRO */}
        <Button
          title="Criar novo Pacto"
          type="secondary"
          onPress={() => setCurrentScreen('SIGNUP')}
        />
      </View>
    </KeyboardAvoidingView>
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