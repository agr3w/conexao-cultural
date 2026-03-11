import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import ImageActionButtons from '../components/ImageActionButtons';
import ProfileAvatar, { FALLBACK_AVATAR_STYLES } from '../components/ProfileAvatar';
import { getViewerProfileById, updateViewerProfile } from '../service/viewerProfiles';
import { getArtistProfileById, updateArtistProfile } from '../service/artistProfiles';
import { pickImageFromCamera, pickImageFromLibrary } from '../service/mediaPicker';

const VIEWER_INTENTIONS = [
  { id: 'solo', label: 'Jornada Solo', icon: 'person' },
  { id: 'date', label: 'Encontro Romântico', icon: 'heart' },
  { id: 'friends', label: 'Role com a Guilda', icon: 'people' },
  { id: 'business', label: 'Networking', icon: 'briefcase' },
];

const INTEREST_PRESETS = ['Rock', 'Jazz', 'MPB', 'Eletrônico', 'Hip-Hop', 'Pop', 'Samba'];

export default function EditProfile({
  onBack,
  onSaved,
  profileType = 'viewer',
  profileId,
}) {
  const isArtist = profileType === 'artist';

  const profile = useMemo(() => {
    return isArtist ? getArtistProfileById(profileId) : getViewerProfileById(profileId);
  }, [isArtist, profileId]);

  const [name, setName] = useState(profile?.name || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [intention, setIntention] = useState(profile?.intention || '');
  const [email] = useState(profile?.email || '');
  const [cpf] = useState(profile?.cpf || 'Não informado');
  const [interestsText, setInterestsText] = useState((profile?.interests || []).join(', '));

  const [vibe, setVibe] = useState(profile?.vibe || '');
  const [entity, setEntity] = useState(profile?.entity || '');
  const [techRider, setTechRider] = useState(profile?.techRider || '');
  const [portfolio, setPortfolio] = useState(profile?.links?.portfolio || '');
  const [gallery, setGallery] = useState(profile?.links?.gallery || '');
  const [communityTitle, setCommunityTitle] = useState(profile?.communityTitle || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [avatarFallbackStyle, setAvatarFallbackStyle] = useState(profile?.avatarFallbackStyle || 'sigil');

  const chooseAvatarFromLibrary = async () => {
    try {
      const uri = await pickImageFromLibrary();
      if (uri) {
        setAvatarUrl(uri);
      }
    } catch (error) {
      alert(error?.message || 'Não foi possível abrir a galeria.');
    }
  };

  const chooseAvatarFromCamera = async () => {
    try {
      const uri = await pickImageFromCamera();
      if (uri) {
        setAvatarUrl(uri);
      }
    } catch (error) {
      alert(error?.message || 'Não foi possível abrir a câmera.');
    }
  };

  const removeAvatar = () => {
    setAvatarUrl('');
  };

  const saveProfile = () => {
    try {
      if (!profileId) {
        throw new Error('Perfil não encontrado para edição.');
      }

      if (isArtist) {
        updateArtistProfile(profileId, {
          name,
          handle,
          vibe,
          entity,
          bio,
          avatarUrl,
          avatarFallbackStyle,
          techRider,
          communityTitle,
          links: {
            portfolio,
            gallery,
          },
        });
      } else {
        updateViewerProfile(profileId, {
          name,
          handle,
          city,
          bio,
          intention,
          interests: interestsText,
          avatarUrl,
          avatarFallbackStyle,
        });
      }

      onSaved?.();
    } catch (error) {
      alert(error?.message || 'Não foi possível salvar as alterações.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[THEME.colors.primary, '#070707']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Refinar Perfil</Text>
        <Text style={styles.heroSub}>
          {isArtist ? 'Aprimore sua vitrine profissional.' : 'Ajuste sua identidade no Caos.'}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Retrato do Perfil</Text>
          <View style={styles.avatarRow}>
            <ProfileAvatar
              uri={avatarUrl}
              name={name}
              variant={avatarFallbackStyle}
              size={84}
              borderWidth={2}
              borderColor={THEME.colors.primary}
              style={styles.avatarPreview}
            />
            <View style={{ flex: 1 }}>
              <View style={styles.avatarActionRow}>
                <ImageActionButtons
                  onPickLibrary={chooseAvatarFromLibrary}
                  onPickCamera={chooseAvatarFromCamera}
                  onRemove={removeAvatar}
                />
              </View>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Estilo do ícone sem foto</Text>
          <View style={styles.styleRow}>
            {FALLBACK_AVATAR_STYLES.map((item) => {
              const selected = avatarFallbackStyle === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.styleChip, selected && styles.styleChipActive]}
                  onPress={() => setAvatarFallbackStyle(item.id)}
                >
                  <Ionicons name={item.icon} size={14} color={selected ? '#000' : THEME.colors.primary} />
                  <Text style={[styles.styleChipText, selected && styles.styleChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identidade</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Nome" placeholderTextColor="#666" style={styles.input} />
          <TextInput value={handle} onChangeText={setHandle} placeholder="Handle / @arroba" placeholderTextColor="#666" style={styles.input} autoCapitalize="none" />
          <TextInput value={bio} onChangeText={setBio} placeholder="Bio" placeholderTextColor="#666" multiline style={[styles.input, styles.textArea]} />

          {!isArtist && (
            <>
              <TextInput value={city} onChangeText={setCity} placeholder="Cidade/Base" placeholderTextColor="#666" style={styles.input} />

              <Text style={styles.lockedLabel}>E-mail (imutável)</Text>
              <TextInput value={email} editable={false} placeholder="E-mail" placeholderTextColor="#666" style={[styles.input, styles.inputLocked]} />

              <Text style={styles.lockedLabel}>CPF (imutável)</Text>
              <TextInput value={cpf} editable={false} placeholder="CPF" placeholderTextColor="#666" style={[styles.input, styles.inputLocked]} />

              <Text style={styles.subSectionTitle}>Objetivo principal</Text>
              <View style={styles.preferenceGrid}>
                {VIEWER_INTENTIONS.map((item) => {
                  const selected = intention === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.preferenceChip, selected && styles.preferenceChipActive]}
                      onPress={() => setIntention(item.id)}
                    >
                      <Ionicons name={item.icon} size={14} color={selected ? '#000' : THEME.colors.primary} />
                      <Text style={[styles.preferenceChipText, selected && styles.preferenceChipTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.subSectionTitle}>Gostos e interesses</Text>
              <TextInput
                value={interestsText}
                onChangeText={setInterestsText}
                placeholder="Ex: Rock, Jazz, MPB"
                placeholderTextColor="#666"
                style={styles.input}
              />

              <View style={styles.styleRow}>
                {INTEREST_PRESETS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.styleChip}
                    onPress={() => {
                      const current = interestsText
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean);

                      if (!current.some((value) => value.toLowerCase() === item.toLowerCase())) {
                        setInterestsText([...current, item].join(', '));
                      }
                    }}
                  >
                    <Text style={styles.styleChipText}>+ {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {isArtist && (
            <>
              <TextInput value={vibe} onChangeText={setVibe} placeholder="Vibe principal" placeholderTextColor="#666" style={styles.input} />
              <TextInput value={entity} onChangeText={setEntity} placeholder="Formação da entidade" placeholderTextColor="#666" style={styles.input} />
              <TextInput value={communityTitle} onChangeText={setCommunityTitle} placeholder="Nome da comunidade" placeholderTextColor="#666" style={styles.input} />
            </>
          )}
        </View>

        {isArtist && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Arsenal</Text>
              <TextInput value={portfolio} onChangeText={setPortfolio} placeholder="Link do portfólio" placeholderTextColor="#666" style={styles.input} />
              <TextInput value={gallery} onChangeText={setGallery} placeholder="Link de galeria" placeholderTextColor="#666" style={styles.input} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Rider Técnico</Text>
              <TextInput
                value={techRider}
                onChangeText={setTechRider}
                placeholder="Descreva suas exigências de palco"
                placeholderTextColor="#666"
                multiline
                style={[styles.input, styles.textArea]}
              />
            </View>
          </>
        )}

        <View style={{ marginTop: 8 }}>
          <Button title="Salvar Alterações" type="primary" onPress={saveProfile} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  hero: { paddingTop: 54, paddingHorizontal: 18, paddingBottom: 20 },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,200,0,0.85)',
    borderRadius: 14,
    padding: 6,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#000',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 28,
  },
  heroSub: {
    marginTop: 6,
    color: '#222',
    fontFamily: 'Lato_700Bold',
  },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatarPreview: {
    backgroundColor: '#111',
  },
  avatarActionRow: {
    marginTop: 8,
  },
  subSectionTitle: {
    marginTop: 10,
    color: '#999',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  styleRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111',
  },
  styleChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  styleChipText: {
    marginLeft: 6,
    color: '#D0D0D0',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  styleChipTextActive: {
    color: '#000',
  },
  sectionTitle: {
    color: THEME.colors.primary,
    fontFamily: 'Cinzel_700Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 9,
    backgroundColor: '#101010',
    color: '#EEE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Lato_400Regular',
    marginBottom: 10,
  },
  inputLocked: {
    opacity: 0.65,
  },
  lockedLabel: {
    color: '#888',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    marginBottom: 6,
  },
  preferenceGrid: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111',
  },
  preferenceChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  preferenceChipText: {
    marginLeft: 6,
    color: '#D0D0D0',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  preferenceChipTextActive: {
    color: '#000',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
