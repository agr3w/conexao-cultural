import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { THEME } from './src/styles/colors';
import BottomMenu from './src/components/BottomMenu';
import CustomDrawer from './src/components/CustomDrawer';

import Input from './src/components/Input';
import Button from './src/components/Button';

import SignUp from './src/screens/SignUp';
import Onboarding from './src/screens/Onboarding';
import ProfileSetup from './src/screens/ProfileSetup';
import Feed from './src/screens/Feed';
import Oracle from './src/screens/Oracle';
import MapScreen from './src/screens/MapScreen';
import UserProfile from './src/screens/UserProfile';
import EventDetails from './src/screens/EventDetails';
import PostDetails from './src/screens/PostDetails';
import MyRituals from './src/screens/MyRituals';
import Settings from './src/screens/Settings';
import ArtistProfile from './src/screens/ArtistProfile';
import PlaceProfile from './src/screens/PlaceProfile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [tempProfile, setTempProfile] = useState('viewer');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeOrigin, setPlaceOrigin] = useState('ORACLE');

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

  // Função para abrir detalhes
  const openEventDetails = (id) => {
    setSelectedEventId(id);
    setCurrentScreen('EVENT_DETAILS');
  };

  const openPostDetails = (post) => {
    setSelectedPost(post);

    if (post?.type === 'event') {
      setSelectedEventId(post?.eventId ?? post?.id ?? null);
      setCurrentScreen('EVENT_DETAILS');
      return;
    }

    setCurrentScreen('POST_DETAILS');
  };

  const handleOracleResultPress = (item) => {
    if (item?.type === 'artist') {
      setCurrentScreen('ARTIST_PROFILE');
      return;
    }

    if (item?.type === 'place') {
      setSelectedPlace(item);
      setPlaceOrigin('ORACLE');
      setCurrentScreen('PLACE_PROFILE');
    }
  };

  // GRUPO 1: TELAS DE AUTENTICAÇÃO (Sem barra inferior)
  const isAuthScreen = ['LOGIN', 'SIGNUP', 'ONBOARDING', 'PROFILE_SETUP', 'EVENT_DETAILS', 'ARTIST_PROFILE', 'POST_DETAILS'].includes(currentScreen);

  if (isAuthScreen) {
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

    if (currentScreen === 'EVENT_DETAILS') {
      return (
        <EventDetails
          eventId={selectedEventId}
          onBack={() => setCurrentScreen('FEED')}
        />
      );
    }

    if (currentScreen === 'POST_DETAILS') {
      return (
        <PostDetails
          post={selectedPost}
          onBack={() => setCurrentScreen('FEED')}
        />
      );
    }
  }

  if (currentScreen === 'MY_RITUALS') {
    return (
      <MyRituals
        onBack={() => setCurrentScreen('FEED')}
      />
    );
  }

  if (currentScreen === 'SETTINGS') {
    return (
      <Settings
        onBack={() => setCurrentScreen('FEED')} // Volta pro Feed
        onLogout={() => {
          alert('Você abandonou o pacto.');
          setCurrentScreen('LOGIN'); // Sai do app
        }}
      />
    );
  }

  if (currentScreen === 'ARTIST_PROFILE') {
    return (
      <ArtistProfile
        onBack={() => setCurrentScreen('FEED')}
      />
    );
  }

  if (currentScreen === 'PLACE_PROFILE') {
    return (
      <PlaceProfile
        place={selectedPlace}
        onBack={() => setCurrentScreen(placeOrigin)}
        onOpenMap={() => setCurrentScreen('MAP')}
      />
    );
  }

  // GRUPO 2: TELAS PRINCIPAIS (Com barra inferior)
  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      {/* Renderiza a tela ativa */}
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {/* PaddingBottom evita que o conteúdo fique atrás da barra */}
        {currentScreen === 'FEED' && (
          <Feed
            onOpenMenu={() => setIsMenuOpen(true)}
            onPostClick={openPostDetails}
            userProfile={tempProfile}
          />
        )}

        {currentScreen === 'ORACLE' && <Oracle onResultPress={handleOracleResultPress} />}

        {currentScreen === 'MAP' && (
          <MapScreen
            onOpenMenu={() => setIsMenuOpen(true)}
            onPlacePress={(place) => {
              setSelectedPlace(place);
              setPlaceOrigin('MAP');
              setCurrentScreen('PLACE_PROFILE');
            }}
          />
        )}

        {currentScreen === 'USER_PROFILE' && (
          <UserProfile onBack={() => setCurrentScreen('FEED')} />
        )}
      </View>

      {/* BARRA INFERIOR FIXA */}
      <BottomMenu
        currentScreen={currentScreen}
        onChangeScreen={setCurrentScreen}
      />

      {/* Opcional: Drawer Lateral para configurações/logout */}
      <CustomDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setIsMenuOpen(false);
        }}
      />
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