import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Easing } from 'react-native';
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
import HiddenPosts from './src/screens/HiddenPosts';
import ArtistProfile from './src/screens/ArtistProfile';
import PlaceProfile from './src/screens/PlaceProfile';
import ArtistHub from './src/screens/ArtistHub';
import ArtistInsights from './src/screens/ArtistInsights';
import CommunityFeed from './src/screens/CommunityFeed';
import ComposeRitual from './src/screens/ComposeRitual';
import EditProfile from './src/screens/EditProfile';
import { getDefaultArtistProfile, createArtistProfile, ensureLabArtistProfile, getArtistProfileById } from './src/service/artistProfiles';
import { getOrCreateCommunityByArtistProfileId } from './src/service/fanCommunities';
import { createViewerProfile, ensureLabViewerProfile, getViewerProfileById } from './src/service/viewerProfiles';
import { ensureAccountCredentials } from './src/service/accountCredentials';

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
  const [editTarget, setEditTarget] = useState({ type: 'viewer', id: null, backScreen: 'FEED' });

  const [activeArtistProfileId, setActiveArtistProfileId] = useState(
    () => (getDefaultArtistProfile('u_artist_1') ?? ensureLabArtistProfile('u_artist_1'))?.id ?? null
  );

  const [pendingSignUp, setPendingSignUp] = useState(null);
  const [pendingOnboardingTags, setPendingOnboardingTags] = useState([]);

  const [activeViewerProfileId, setActiveViewerProfileId] = useState(
    () => ensureLabViewerProfile('u_viewer_1')?.id ?? null
  );
  const transitionAnim = useRef(new Animated.Value(1)).current;

  let [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    transitionAnim.setValue(0);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentScreen, transitionAnim, fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  const screenTransitionStyle = {
    opacity: transitionAnim,
    transform: [
      {
        translateY: transitionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const renderWithTransition = (content) => (
    <Animated.View style={[styles.screenAnimatedContainer, screenTransitionStyle]}>
      {content}
    </Animated.View>
  );

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
  const currentOwnerUserId = tempProfile === 'artist'
    ? (activeArtistProfile?.ownerUserId || 'u_artist_1')
    : (activeViewerProfile?.ownerUserId || 'u_viewer_1');

  const currentDisplayName = tempProfile === 'artist'
    ? (activeArtistProfile?.name || 'Artista')
    : (activeViewerProfile?.name || 'Viajante do Caos');

  const currentDisplayHandle = tempProfile === 'artist'
    ? (activeArtistProfile?.handle || '@artista')
    : (activeViewerProfile?.handle || '@viajante_01');

  const currentAvatarUrl = tempProfile === 'artist'
    ? (activeArtistProfile?.avatarUrl || '')
    : (activeViewerProfile?.avatarUrl || '');

  const currentAvatarFallbackStyle = tempProfile === 'artist'
    ? (activeArtistProfile?.avatarFallbackStyle || 'sigil')
    : (activeViewerProfile?.avatarFallbackStyle || 'sigil');

  // GRUPO 1: TELAS DE AUTENTICAÇÃO (Sem barra inferior)
  const isAuthScreen = ['LOGIN', 'SIGNUP', 'ONBOARDING', 'PROFILE_SETUP', 'EVENT_DETAILS', 'ARTIST_PROFILE', 'POST_DETAILS'].includes(currentScreen);

  if (isAuthScreen) {
    if (currentScreen === 'LOGIN') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
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
          )}
        </View>
      );
    }

    if (currentScreen === 'SIGNUP') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
            <SignUp
              onBack={() => setCurrentScreen('LOGIN')}
              onNext={(payload) => {
                setPendingSignUp(payload);
                setTempProfile(payload?.userProfile || 'viewer');
                setCurrentScreen('ONBOARDING');
              }}
            />
          )}
        </View>
      );
    }

    if (currentScreen === 'ONBOARDING') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
            <Onboarding
              userProfile={tempProfile}
              onFinish={(tags) => {
                setPendingOnboardingTags(tags || []);
                setCurrentScreen('PROFILE_SETUP');
              }}
            />
          )}
        </View>
      );
    }

    if (currentScreen === 'PROFILE_SETUP') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
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
                      avatarUrl: data.avatarUrl,
                      avatarFallbackStyle: data.avatarFallbackStyle,
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
                      avatarUrl: data.avatarUrl,
                      avatarFallbackStyle: data.avatarFallbackStyle,
                      interests: pendingOnboardingTags,
                    });
                    setActiveViewerProfileId(createdViewer.id);
                  }

                  ensureAccountCredentials({
                    ownerUserId: tempProfile === 'artist' ? 'u_artist_1' : 'u_viewer_1',
                    email: account.email,
                    password: account.password,
                  });
                } catch (error) {
                  alert(error?.message || 'Falha ao salvar perfil.');
                }

                setCurrentScreen('FEED');
              }}
            />
          )}
        </View>
      );
    }

    if (currentScreen === 'EVENT_DETAILS') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
            <EventDetails
              eventId={selectedEventId}
              onBack={() => setCurrentScreen('FEED')}
            />
          )}
        </View>
      );
    }

    if (currentScreen === 'POST_DETAILS') {
      return (
        <View style={styles.screenBase}>
          {renderWithTransition(
            <PostDetails
              post={selectedPost}
              onOpenPost={openPostDetails}
              currentUserName={currentDisplayName}
              currentUserHandle={currentDisplayHandle}
              currentUserAvatarUrl={currentAvatarUrl}
              currentUserAvatarFallbackStyle={currentAvatarFallbackStyle}
              likeOwnerUserId={currentOwnerUserId}
              currentUserKind={tempProfile === 'artist' ? 'artist' : 'viewer'}
              onPostInteraction={() => setFeedRefreshTick((prev) => prev + 1)}
              onBack={() => setCurrentScreen('FEED')}
            />
          )}
        </View>
      );
    }
  }

  if (currentScreen === 'MY_RITUALS') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <MyRituals
            userProfile={tempProfile}
            onBack={() => setCurrentScreen('FEED')}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'SETTINGS') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <Settings
            userProfile={tempProfile}
            ownerUserId={currentOwnerUserId}
            refreshTick={feedRefreshTick}
            onBack={() => setCurrentScreen('FEED')}
            onOpenHiddenPosts={() => setCurrentScreen('HIDDEN_POSTS')}
            onEditProfile={() => {
              setEditTarget({
                type: tempProfile,
                id: tempProfile === 'artist' ? activeArtistProfileId : activeViewerProfileId,
                backScreen: 'SETTINGS',
              });
              setCurrentScreen('EDIT_PROFILE');
            }}
            onLogout={() => {
              alert('Você abandonou o pacto.');
              setCurrentScreen('LOGIN');
            }}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'HIDDEN_POSTS') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <HiddenPosts
            ownerUserId={currentOwnerUserId}
            refreshTick={feedRefreshTick}
            onBack={() => setCurrentScreen('SETTINGS')}
            onChanged={() => setFeedRefreshTick((prev) => prev + 1)}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'ARTIST_PROFILE') {
    const profileId = selectedArtistRef?.id ?? activeArtistProfileId ?? null;

    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <ArtistProfile
            artistProfileId={profileId}
            artistPreviewName={selectedArtistRef?.name}
            onBack={() => setCurrentScreen(artistOrigin)}
            onEditProfile={() => {
              setEditTarget({ type: 'artist', id: profileId, backScreen: 'ARTIST_PROFILE' });
              setCurrentScreen('EDIT_PROFILE');
            }}
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
        )}
      </View>
    );
  }

  if (currentScreen === 'PLACE_PROFILE') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <PlaceProfile
            place={selectedPlace}
            onBack={() => setCurrentScreen(placeOrigin)}
            onOpenMap={() => setCurrentScreen('MAP')}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'ARTIST_HUB') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <ArtistHub onBack={() => setCurrentScreen('FEED')} />
        )}
      </View>
    );
  }

  if (currentScreen === 'ARTIST_INSIGHTS') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <ArtistInsights onBack={() => setCurrentScreen('FEED')} />
        )}
      </View>
    );
  }

  if (currentScreen === 'COMMUNITY_FEED') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <CommunityFeed
            communityId={selectedCommunityId}
            onBack={() => setCurrentScreen('ARTIST_PROFILE')}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'COMPOSE_RITUAL') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <ComposeRitual
            userProfile={tempProfile}
            ownerUserId="u_artist_1"
            artistProfileId={activeArtistProfileId}
            currentUserName={currentDisplayName}
            currentUserHandle={currentDisplayHandle}
            currentUserAvatarUrl={currentAvatarUrl}
            currentUserAvatarFallbackStyle={currentAvatarFallbackStyle}
            onBack={() => setCurrentScreen(composeOrigin)}
            onPublished={() => {
              setFeedRefreshTick((prev) => prev + 1);
              setCurrentScreen('FEED');
            }}
          />
        )}
      </View>
    );
  }

  if (currentScreen === 'EDIT_PROFILE') {
    return (
      <View style={styles.screenBase}>
        {renderWithTransition(
          <EditProfile
            profileType={editTarget.type}
            profileId={editTarget.id}
            onBack={() => setCurrentScreen(editTarget.backScreen || 'FEED')}
            onSaved={() => {
              setFeedRefreshTick((prev) => prev + 1);
              setCurrentScreen(editTarget.backScreen || 'FEED');
            }}
          />
        )}
      </View>
    );
  }

  // GRUPO 2: TELAS PRINCIPAIS (Com barra inferior)
  return (
    <View style={styles.screenBase}>
      <View style={{ flex: 1, paddingBottom: 70 }}>
        {renderWithTransition(
          <>
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
                currentUserAvatarUrl={currentAvatarUrl}
                currentUserAvatarFallbackStyle={currentAvatarFallbackStyle}
                likeOwnerUserId={currentOwnerUserId}
                onLikeChanged={() => setFeedRefreshTick((prev) => prev + 1)}
              />
            )}

            {currentScreen === 'ORACLE' && <Oracle onResultPress={handleOracleResultPress} />}

            {currentScreen === 'USER_PROFILE' && (
              <UserProfile
                viewerProfileId={activeViewerProfileId}
                ownerUserId={currentOwnerUserId}
                refreshTick={feedRefreshTick}
                onBack={() => setCurrentScreen('FEED')}
                onEditProfile={() => {
                  setEditTarget({ type: 'viewer', id: activeViewerProfileId, backScreen: 'USER_PROFILE' });
                  setCurrentScreen('EDIT_PROFILE');
                }}
              />
            )}
          </>
        )}
      </View>

      <CustomDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userProfile={tempProfile}
        displayName={currentDisplayName}
        displayHandle={currentDisplayHandle}
        avatarUrl={currentAvatarUrl}
        avatarFallbackStyle={currentAvatarFallbackStyle}
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
  screenBase: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  screenAnimatedContainer: {
    flex: 1,
  },
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