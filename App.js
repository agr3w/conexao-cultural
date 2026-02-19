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
import ArtistHub from './src/screens/ArtistHub';
import ArtistInsights from './src/screens/ArtistInsights';
import CommunityFeed from './src/screens/CommunityFeed';
import ComposeRitual from './src/screens/ComposeRitual';
import { getDefaultArtistProfile, createArtistProfile, ensureLabArtistProfile, getArtistProfileById } from './src/service/artistProfiles';
import { getOrCreateCommunityByArtistProfileId } from './src/service/fanCommunities';
import { createViewerProfile, ensureLabViewerProfile, getViewerProfileById } from './src/service/viewerProfiles';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [tempProfile, setTempProfile] = useState('viewer');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeOrigin, setPlaceOrigin] = useState('ORACLE');
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [feedRefreshTick, setFeedRefreshTick] = useState(0);
  const [selectedArtistRef, setSelectedArtistRef] = useState(null);
  const [artistOrigin, setArtistOrigin] = useState('FEED');
  const [composeOrigin, setComposeOrigin] = useState('FEED');

  const [activeArtistProfileId, setActiveArtistProfileId] = useState(
    () => (getDefaultArtistProfile('u_artist_1') ?? ensureLabArtistProfile('u_artist_1'))?.id ?? null
  );

  const [pendingSignUp, setPendingSignUp] = useState(null);
  const [pendingOnboardingTags, setPendingOnboardingTags] = useState([]);

  const [activeViewerProfileId, setActiveViewerProfileId] = useState(
    () => ensureLabViewerProfile('u_viewer_1')?.id ?? null
  );

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
      setSelectedArtistRef({
        id: item?.profileId ?? null,
        name: item?.name ?? 'Artista',
      });
      setArtistOrigin('ORACLE');
      setCurrentScreen('ARTIST_PROFILE');
      return;
    }

    if (item?.type === 'place') {
      setSelectedPlace(item);
      setPlaceOrigin('ORACLE');
      setCurrentScreen('PLACE_PROFILE');
      return;
    }

    if (item?.type === 'community') {
      setSelectedCommunityId(item?.communityId ?? null);
      setCurrentScreen('COMMUNITY_FEED');
    }
  };

  const openFanCommunity = (communityId) => {
    setSelectedCommunityId(communityId);
    setCurrentScreen('COMMUNITY_FEED');
  };

  const handleBandPostCreated = () => {
    setFeedRefreshTick((prev) => prev + 1);
  };

  const activeArtistProfile = activeArtistProfileId ? getArtistProfileById(activeArtistProfileId) : null;
  const activeViewerProfile = activeViewerProfileId ? getViewerProfileById(activeViewerProfileId) : null;

  const currentDisplayName = tempProfile === 'artist'
    ? (activeArtistProfile?.name || 'Artista')
    : (activeViewerProfile?.name || 'Viajante do Caos');

  const currentDisplayHandle = tempProfile === 'artist'
    ? (activeArtistProfile?.handle || '@artista')
    : (activeViewerProfile?.handle || '@viajante_01');

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
          onNext={(payload) => {
            setPendingSignUp(payload);
            setTempProfile(payload?.userProfile || 'viewer');
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
            setPendingOnboardingTags(tags || []);
            setCurrentScreen('PROFILE_SETUP');
          }}
        />
      );
    }

    if (currentScreen === 'PROFILE_SETUP') {
      return (
        <ProfileSetup
          userProfile={tempProfile}
          onFinish={(payload) => {
            const data = payload?.profileSetup ?? {};
            const account = pendingSignUp?.account ?? {};
            const artistSeed = pendingSignUp?.artistSeed ?? {};

            try {
              if (tempProfile === 'artist') {
                const created = createArtistProfile({
                  ownerUserId: 'u_artist_1',
                  name: data.artistName || account.fullName || 'Novo Artista',
                  handle: data.artistHandle || account.handle,
                  vibe: data.artistVibe || artistSeed.genre,
                  entity: data.entityType,
                  bio: data.bio,
                  techRider: data.techRider,
                  links: {
                    portfolio: data?.links?.portfolio || artistSeed.portfolio,
                    gallery: data?.links?.gallery,
                  },
                  communityTitle: `Clã de ${data.artistName || account.fullName || 'Artista'}`,
                });
                setActiveArtistProfileId(created.id);
              } else {
                const createdViewer = createViewerProfile({
                  ownerUserId: 'u_viewer_1',
                  name: account.fullName || 'Viajante',
                  handle: account.handle,
                  email: account.email,
                  city: data.baseCity,
                  bio: data.bio,
                  intention: data.intention,
                  interests: pendingOnboardingTags,
                });
                setActiveViewerProfileId(createdViewer.id);
              }
            } catch (error) {
              alert(error?.message || 'Falha ao salvar perfil.');
            }

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
        userProfile={tempProfile}
        onBack={() => setCurrentScreen('FEED')}
      />
    );
  }

  if (currentScreen === 'SETTINGS') {
    return (
      <Settings
        userProfile={tempProfile}
        onBack={() => setCurrentScreen('FEED')}
        onLogout={() => {
          alert('Você abandonou o pacto.');
          setCurrentScreen('LOGIN');
        }}
      />
    );
  }

  if (currentScreen === 'ARTIST_PROFILE') {
    const profileId = selectedArtistRef?.id ?? activeArtistProfileId ?? null;

    return (
      <ArtistProfile
        artistProfileId={profileId}
        artistPreviewName={selectedArtistRef?.name}
        onBack={() => setCurrentScreen(artistOrigin)}
        onOpenCommunity={() => {
          if (!profileId) {
            alert('Este perfil pode ter sido deletado ou não está mais disponível.');
            return;
          }

          try {
            const community = getOrCreateCommunityByArtistProfileId(profileId);
            openFanCommunity(community.id);
          } catch (error) {
            alert('Este perfil pode ter sido deletado ou não está mais disponível.');
          }
        }}
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

  if (currentScreen === 'ARTIST_HUB') {
    return <ArtistHub onBack={() => setCurrentScreen('FEED')} />;
  }

  if (currentScreen === 'ARTIST_INSIGHTS') {
    return <ArtistInsights onBack={() => setCurrentScreen('FEED')} />;
  }

  if (currentScreen === 'COMMUNITY_FEED') {
    return (
      <CommunityFeed
        communityId={selectedCommunityId}
        onBack={() => setCurrentScreen('ARTIST_PROFILE')}
      />
    );
  }

  if (currentScreen === 'COMPOSE_RITUAL') {
    return (
      <ComposeRitual
        userProfile={tempProfile}
        ownerUserId="u_artist_1"
        artistProfileId={activeArtistProfileId}
        currentUserName={currentDisplayName}
        currentUserHandle={currentDisplayHandle}
        onBack={() => setCurrentScreen(composeOrigin)}
        onPublished={() => {
          setFeedRefreshTick((prev) => prev + 1);
          setCurrentScreen('FEED');
        }}
      />
    );
  }

  // GRUPO 2: TELAS PRINCIPAIS (Com barra inferior)
  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {currentScreen === 'MAP' && (
          <MapScreen
            userProfile={tempProfile}
            onOpenMenu={() => setIsMenuOpen(true)}
            onPlacePress={(place) => {
              setSelectedPlace(place);
              setPlaceOrigin('MAP');
              setCurrentScreen('PLACE_PROFILE');
            }}
            onPitchPress={(place) => {
              alert(`Tributo enviado para ${place.name}`);
            }}
          />
        )}

        {currentScreen === 'FEED' && (
          <Feed
            onOpenMenu={() => setIsMenuOpen(true)}
            onPostClick={openPostDetails}
            onOpenComposer={() => {
              setComposeOrigin('FEED');
              setCurrentScreen('COMPOSE_RITUAL');
            }}
            userProfile={tempProfile}
            onBandPostCreated={handleBandPostCreated}
            refreshTick={feedRefreshTick}
            artistProfileId={activeArtistProfileId}
            ownerUserId="u_artist_1"
            currentUserName={currentDisplayName}
            currentUserHandle={currentDisplayHandle}
          />
        )}

        {currentScreen === 'ORACLE' && <Oracle onResultPress={handleOracleResultPress} />}

        {currentScreen === 'USER_PROFILE' && (
          <UserProfile
            viewerProfileId={activeViewerProfileId}
            onBack={() => setCurrentScreen('FEED')}
          />
        )}
      </View>

      <CustomDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userProfile={tempProfile}
        displayName={currentDisplayName}
        displayHandle={currentDisplayHandle}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setIsMenuOpen(false);
        }}
      />

      <BottomMenu
        currentScreen={currentScreen}
        onChangeScreen={(screen) => {
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