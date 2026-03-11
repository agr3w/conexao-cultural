import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CommonActions, DarkTheme, NavigationContainer, TabActions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { THEME } from './src/styles/colors';
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

import { getPostById } from './src/service/feedPosts';
import { getDefaultArtistProfile, createArtistProfile, ensureLabArtistProfile, getArtistProfileById } from './src/service/artistProfiles';
import { getOrCreateCommunityByArtistProfileId } from './src/service/fanCommunities';
import { createViewerProfile, ensureLabViewerProfile, getViewerProfileById } from './src/service/viewerProfiles';
import { ensureAccountCredentials } from './src/service/accountCredentials';

const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const APP_NAV_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: THEME.colors.primary,
    background: THEME.colors.background,
    card: THEME.colors.background,
    border: '#1F1F1F',
    text: THEME.colors.text,
  },
};

const STACK_CONTENT_STYLE = { backgroundColor: THEME.colors.background };

const TRANSITION_PRESETS = {
  base: {
    headerShown: false,
    freezeOnBlur: false,
    contentStyle: STACK_CONTENT_STYLE,
  },
  fadeEntry: {
    animation: 'fade',
    contentStyle: STACK_CONTENT_STYLE,
  },
  instagramSmooth: {
    animation: 'slide_from_right',
    gestureEnabled: true,
    animationMatchesGesture: true,
    contentStyle: STACK_CONTENT_STYLE,
  },
  xFast: {
    animation: 'slide_from_right',
    gestureEnabled: true,
    animationMatchesGesture: true,
    contentStyle: STACK_CONTENT_STYLE,
  },
  agendaStable: {
    animation: 'slide_from_right',
    gestureEnabled: true,
    animationMatchesGesture: true,
    contentStyle: STACK_CONTENT_STYLE,
  },
  composeModal: {
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
    animationMatchesGesture: true,
    contentStyle: STACK_CONTENT_STYLE,
  },
};

function LoginScreen({ onLogin, onGoSignUp }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={{ fontSize: 60 }}>👁️</Text>
        <Text style={styles.title}>CONEXÃO{"\n"}CULTURAL</Text>
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
          onPress={onLogin}
        />

        <Button
          title="Criar novo Pacto"
          type="secondary"
          onPress={onGoSignUp}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function AppContent() {
  const [tempProfile, setTempProfile] = useState('viewer');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [feedRefreshTick, setFeedRefreshTick] = useState(0);

  const [activeArtistProfileId, setActiveArtistProfileId] = useState(
    () => (getDefaultArtistProfile('u_artist_1') ?? ensureLabArtistProfile('u_artist_1'))?.id ?? null
  );

  const [pendingSignUp, setPendingSignUp] = useState(null);
  const [pendingOnboardingTags, setPendingOnboardingTags] = useState([]);

  const [activeViewerProfileId, setActiveViewerProfileId] = useState(
    () => ensureLabViewerProfile('u_viewer_1')?.id ?? null
  );

  const [pendingEditTarget, setPendingEditTarget] = useState({ type: 'viewer', id: null });

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

  const handleBandPostCreated = () => {
    setFeedRefreshTick((prev) => prev + 1);
  };

  const goBackSafely = (navigation, fallbackRoute) => {
    if (navigation?.canGoBack?.()) {
      navigation.dispatch(CommonActions.goBack());
      return;
    }

    if (fallbackRoute) {
      navigation.navigate(fallbackRoute.name, fallbackRoute.params);
      return;
    }

    navigation.navigate('MainTabs', { screen: 'FeedTab' });
  };

  const openPostDetails = (post) => {
    if (!navigationRef.isReady() || !post) return;

    if (post?.type === 'event') {
      navigationRef.navigate('EventDetails', { eventId: post?.eventId ?? post?.id ?? null });
      return;
    }

    navigationRef.navigate('PostDetails', { post });
  };

  const openAgendaCommitment = (commitment) => {
    const sourcePost = getPostById(commitment?.sourcePostId);
    if (!sourcePost) {
      Alert.alert('Ops', 'Não foi possível abrir os detalhes deste compromisso.');
      return;
    }

    if (!navigationRef.isReady()) return;

    if (sourcePost.type === 'event') {
      navigationRef.navigate('EventDetails', { eventId: sourcePost.id });
      return;
    }

    navigationRef.navigate('PostDetails', { post: sourcePost });
  };

  const handleOracleResultPress = (item) => {
    if (!navigationRef.isReady()) return;

    if (item?.type === 'artist') {
      navigationRef.navigate('ArtistProfile', {
        artistProfileId: item?.profileId ?? null,
        artistPreviewName: item?.name ?? 'Artista',
      });
      return;
    }

    if (item?.type === 'place') {
      navigationRef.navigate('PlaceProfile', {
        place: item,
      });
      return;
    }

    if (item?.type === 'community') {
      navigationRef.navigate('CommunityFeed', {
        communityId: item?.communityId ?? null,
      });
    }
  };

  const mainTabBarStyle = useMemo(
    () => ({
      height: 70,
      backgroundColor: '#0F0F0F',
      borderTopColor: '#222',
      borderTopWidth: 1,
      paddingBottom: 10,
      paddingTop: 4,
    }),
    []
  );

  const MainTabs = () => (
    <View style={styles.mainTabsRoot}>
      <Tab.Navigator
        initialRouteName="FeedTab"
        detachInactiveScreens={false}
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: { backgroundColor: THEME.colors.background },
          tabBarStyle: mainTabBarStyle,
          tabBarActiveTintColor: THEME.colors.primary,
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontFamily: 'Lato_700Bold',
            fontSize: 10,
            marginTop: 2,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = 'ellipse';

            if (route.name === 'FeedTab') iconName = focused ? 'home' : 'home-outline';
            if (route.name === 'OracleTab') iconName = focused ? 'search' : 'search-outline';
            if (route.name === 'MapTab') iconName = focused ? 'map' : 'map-outline';
            if (route.name === 'UserProfileTab') iconName = focused ? 'person' : 'person-outline';

            return <Ionicons name={iconName} size={size ?? 24} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="FeedTab"
          options={{ title: 'O Caos' }}
        >
          {() => (
            <Feed
              onOpenMenu={() => setIsMenuOpen(true)}
              onPostClick={openPostDetails}
              onOpenComposer={() => navigationRef.navigate('ComposeRitual')}
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
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="OracleTab"
          options={{ title: 'Oráculo' }}
        >
          {() => <Oracle onResultPress={handleOracleResultPress} />}
        </Tab.Screen>

        <Tab.Screen
          name="MapTab"
          options={{ title: 'Radar' }}
        >
          {() => (
            <MapScreen
              userProfile={tempProfile}
              ownerUserId={currentOwnerUserId}
              refreshTick={feedRefreshTick}
              onOpenMenu={() => setIsMenuOpen(true)}
              onOpenRitual={(ritual) => {
                const eventId = ritual?.eventId || ritual?.id;
                if (!eventId) return;
                navigationRef.navigate('EventDetails', { eventId });
              }}
              onPlacePress={(place) => navigationRef.navigate('PlaceProfile', { place })}
              onPitchPress={(place) => {
                Alert.alert('Tributo', `Tributo enviado para ${place.name}`);
              }}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="UserProfileTab"
          options={{ title: 'Grimório' }}
        >
          {() => (
            <UserProfile
              viewerProfileId={activeViewerProfileId}
              ownerUserId={currentOwnerUserId}
              refreshTick={feedRefreshTick}
              onBack={() => navigationRef.navigate('MainTabs', { screen: 'FeedTab' })}
              onEditProfile={() => {
                setPendingEditTarget({ type: 'viewer', id: activeViewerProfileId });
                navigationRef.navigate('EditProfile', {
                  profileType: 'viewer',
                  profileId: activeViewerProfileId,
                });
              }}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <CustomDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userProfile={tempProfile}
        displayName={currentDisplayName}
        displayHandle={currentDisplayHandle}
        avatarUrl={currentAvatarUrl}
        avatarFallbackStyle={currentAvatarFallbackStyle}
        onNavigate={(screen) => {
          setIsMenuOpen(false);

          if (!navigationRef.isReady()) return;

          if (screen === 'LOGIN') {
            navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
            return;
          }

          if (screen === 'FEED') {
            navigationRef.dispatch(TabActions.jumpTo('FeedTab'));
            return;
          }

          if (screen === 'MAP') {
            navigationRef.dispatch(TabActions.jumpTo('MapTab'));
            return;
          }

          if (screen === 'USER_PROFILE') {
            navigationRef.dispatch(TabActions.jumpTo('UserProfileTab'));
            return;
          }

          if (screen === 'MY_RITUALS') {
            navigationRef.navigate('MyRituals');
            return;
          }

          if (screen === 'SETTINGS') {
            navigationRef.navigate('Settings');
            return;
          }

          if (screen === 'ARTIST_HUB') {
            navigationRef.navigate('ArtistHub');
            return;
          }

          if (screen === 'ARTIST_INSIGHTS') {
            navigationRef.navigate('ArtistInsights');
          }
        }}
      />
    </View>
  );

  return (
    <NavigationContainer ref={navigationRef} theme={APP_NAV_THEME}>
      <StatusBar style="light" backgroundColor={THEME.colors.background} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={TRANSITION_PRESETS.base}
      >
        <Stack.Screen name="Login" options={TRANSITION_PRESETS.fadeEntry}>
          {({ navigation }) => (
            <LoginScreen
              onLogin={() => navigation.replace('MainTabs')}
              onGoSignUp={() => navigation.navigate('SignUp')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="SignUp" options={TRANSITION_PRESETS.instagramSmooth}>
          {({ navigation }) => (
            <SignUp
              onBack={() => goBackSafely(navigation)}
              onNext={(payload) => {
                setPendingSignUp(payload);
                setTempProfile(payload?.userProfile || 'viewer');
                navigation.navigate('Onboarding');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Onboarding" options={TRANSITION_PRESETS.instagramSmooth}>
          {({ navigation }) => (
            <Onboarding
              userProfile={tempProfile}
              onFinish={(tags) => {
                setPendingOnboardingTags(tags || []);
                navigation.navigate('ProfileSetup');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="ProfileSetup" options={TRANSITION_PRESETS.instagramSmooth}>
          {({ navigation }) => (
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
                  Alert.alert('Erro', error?.message || 'Falha ao salvar perfil.');
                }

                navigation.replace('MainTabs');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="MainTabs" options={TRANSITION_PRESETS.fadeEntry}>
          {() => <MainTabs />}
        </Stack.Screen>

        <Stack.Screen
          name="ComposeRitual"
          options={TRANSITION_PRESETS.composeModal}
        >
          {({ navigation }) => (
            <ComposeRitual
              userProfile={tempProfile}
              ownerUserId="u_artist_1"
              artistProfileId={activeArtistProfileId}
              currentUserName={currentDisplayName}
              currentUserHandle={currentDisplayHandle}
              currentUserAvatarUrl={currentAvatarUrl}
              currentUserAvatarFallbackStyle={currentAvatarFallbackStyle}
              onBack={() => goBackSafely(navigation)}
              onPublished={() => {
                setFeedRefreshTick((prev) => prev + 1);
                goBackSafely(navigation);
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="EventDetails"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => (
            <EventDetails
              eventId={route?.params?.eventId}
              ownerUserId={currentOwnerUserId}
              userProfile={tempProfile}
              onAgendaChanged={() => setFeedRefreshTick((prev) => prev + 1)}
              onBack={() => goBackSafely(navigation)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="PostDetails"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => (
            <PostDetails
              post={route?.params?.post}
              onOpenPost={openPostDetails}
              currentUserName={currentDisplayName}
              currentUserHandle={currentDisplayHandle}
              currentUserAvatarUrl={currentAvatarUrl}
              currentUserAvatarFallbackStyle={currentAvatarFallbackStyle}
              likeOwnerUserId={currentOwnerUserId}
              currentUserKind={tempProfile === 'artist' ? 'artist' : 'viewer'}
              onPostInteraction={() => setFeedRefreshTick((prev) => prev + 1)}
              onBack={() => goBackSafely(navigation)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="MyRituals"
          options={{
            ...TRANSITION_PRESETS.agendaStable,
            fullScreenGestureEnabled: false,
          }}
        >
          {({ navigation }) => (
            <MyRituals
              userProfile={tempProfile}
              ownerUserId={currentOwnerUserId}
              refreshTick={feedRefreshTick}
              onAgendaChanged={() => setFeedRefreshTick((prev) => prev + 1)}
              onOpenCommitment={openAgendaCommitment}
              onBack={() => goBackSafely(navigation)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="Settings"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation }) => (
            <Settings
              userProfile={tempProfile}
              ownerUserId={currentOwnerUserId}
              refreshTick={feedRefreshTick}
              onBack={() => goBackSafely(navigation)}
              onOpenHiddenPosts={() => navigation.navigate('HiddenPosts')}
              onEditProfile={() => {
                const editType = tempProfile;
                const editId = tempProfile === 'artist' ? activeArtistProfileId : activeViewerProfileId;
                setPendingEditTarget({ type: editType, id: editId });
                navigation.navigate('EditProfile', { profileType: editType, profileId: editId });
              }}
              onLogout={() => {
                Alert.alert('Pacto encerrado', 'Você abandonou o pacto.');
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="HiddenPosts"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation }) => (
            <HiddenPosts
              ownerUserId={currentOwnerUserId}
              refreshTick={feedRefreshTick}
              onBack={() => goBackSafely(navigation)}
              onChanged={() => setFeedRefreshTick((prev) => prev + 1)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="ArtistProfile"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => {
            const routeProfileId = route?.params?.artistProfileId ?? null;
            const profileId = routeProfileId ?? activeArtistProfileId ?? null;
            const previewName = route?.params?.artistPreviewName;

            return (
              <ArtistProfile
                artistProfileId={profileId}
                artistPreviewName={previewName}
                onBack={() => goBackSafely(navigation)}
                onEditProfile={() => {
                  setPendingEditTarget({ type: 'artist', id: profileId });
                  navigation.navigate('EditProfile', { profileType: 'artist', profileId });
                }}
                onOpenCommunity={() => {
                  if (!profileId) {
                    Alert.alert('Ops', 'Este perfil pode ter sido deletado ou não está mais disponível.');
                    return;
                  }

                  try {
                    const community = getOrCreateCommunityByArtistProfileId(profileId);
                    navigation.navigate('CommunityFeed', { communityId: community.id });
                  } catch {
                    Alert.alert('Ops', 'Este perfil pode ter sido deletado ou não está mais disponível.');
                  }
                }}
              />
            );
          }}
        </Stack.Screen>

        <Stack.Screen
          name="PlaceProfile"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => (
            <PlaceProfile
              place={route?.params?.place}
              onBack={() => goBackSafely(navigation)}
              onOpenMap={() => navigation.navigate('MainTabs', { screen: 'MapTab' })}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="ArtistHub"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation }) => (
            <ArtistHub onBack={() => goBackSafely(navigation)} />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="ArtistInsights"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation }) => (
            <ArtistInsights onBack={() => goBackSafely(navigation)} />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="CommunityFeed"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => (
            <CommunityFeed
              communityId={route?.params?.communityId}
              onBack={() => goBackSafely(navigation)}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="EditProfile"
          options={TRANSITION_PRESETS.xFast}
        >
          {({ navigation, route }) => (
            <EditProfile
              profileType={route?.params?.profileType || pendingEditTarget.type}
              profileId={route?.params?.profileId || pendingEditTarget.id}
              onBack={() => goBackSafely(navigation)}
              onSaved={() => {
                setFeedRefreshTick((prev) => prev + 1);
                goBackSafely(navigation);
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  mainTabsRoot: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
  },
});
