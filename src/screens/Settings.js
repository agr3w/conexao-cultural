import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import Button from '../components/Button';
import { updateAccountPassword } from '../service/accountCredentials';
import { getDefaultViewerProfile } from '../service/viewerProfiles';
import { getDefaultArtistProfile } from '../service/artistProfiles';
import { getLikedPostsByOwner } from '../service/feedPosts';

const RADIUS_STEPS = [10, 25, 50, 100, 200];

const buildNextDays = (count = 30) => {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.getDate(),
      weekDay: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    });
  }
  return out;
};

export default function Settings({
  onBack,
  onLogout,
  userProfile = 'viewer',
  onEditProfile,
  onOpenHiddenPosts,
  ownerUserId,
  refreshTick = 0,
}) {
  const isArtist = userProfile === 'artist';
  const activeProfile = useMemo(() => {
    if (!ownerUserId) return null;
    return isArtist ? getDefaultArtistProfile(ownerUserId) : getDefaultViewerProfile(ownerUserId);
  }, [isArtist, ownerUserId]);

  // Público
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  // Artista
  const [pixKey, setPixKey] = useState('');
  const [bankData, setBankData] = useState('');
  const [radius, setRadius] = useState(50);
  const [blockedDays, setBlockedDays] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeCategory, setActiveCategory] = useState('profile');
  const [isPrivateArchiveOpen, setIsPrivateArchiveOpen] = useState(false);
  const days = useMemo(() => buildNextDays(30), []);
  const likedPosts = useMemo(
    () => getLikedPostsByOwner(ownerUserId).slice(0, 20),
    [ownerUserId, refreshTick]
  );

  const toggleBlockedDay = (iso) => {
    setBlockedDays((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  };

  const viewerIntentionLabel = useMemo(() => {
    const map = {
      solo: 'Jornada Solo',
      date: 'Encontro Romântico',
      friends: 'Role com a Guilda',
      business: 'Networking',
    };
    return map[activeProfile?.intention] || 'Não definido';
  }, [activeProfile?.intention]);

  const topInterests = useMemo(() => {
    const list = Array.isArray(activeProfile?.interests)
      ? activeProfile.interests
      : [];
    return list.slice(0, 3);
  }, [activeProfile?.interests]);

  const lastProfileUpdateLabel = useMemo(() => {
    const raw = activeProfile?.updatedAt || activeProfile?.createdAt;
    if (!raw) return 'Ainda sem alterações registradas';

    const timestamp = Date.parse(raw);
    if (Number.isNaN(timestamp)) return 'Data indisponível';

    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [activeProfile?.updatedAt, activeProfile?.createdAt]);

  const handlePasswordUpdate = () => {
    if (!ownerUserId) {
      alert('Usuário ativo não encontrado para trocar senha.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Preencha senha atual, nova senha e confirmação.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('A confirmação da senha não confere.');
      return;
    }

    try {
      updateAccountPassword({
        ownerUserId,
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Senha alterada com sucesso.');
    } catch (error) {
      alert(error?.message || 'Não foi possível alterar a senha.');
    }
  };

  const formatLikedAt = (value) => {
    const parsed = Date.parse(value || '');
    if (Number.isNaN(parsed)) return 'Agora';

    return new Date(parsed).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const categories = [
    { id: 'profile', label: 'Perfil', icon: 'person-outline' },
    { id: 'system', label: 'Sistema', icon: 'settings-outline' },
    { id: 'privacy', label: 'Privado', icon: 'lock-closed-outline' },
    { id: 'security', label: 'Segurança', icon: 'shield-checkmark-outline' },
  ];

  const showProfile = activeCategory === 'profile';
  const showSystem = activeCategory === 'system';
  const showPrivacy = activeCategory === 'privacy';
  const showSecurity = activeCategory === 'security';

  const SettingItem = ({ icon, label, type = 'arrow', value, onToggle, onPress }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={type === 'switch' ? 1 : 0.7}
      onPress={type === 'arrow' ? (onPress || (() => alert('Em breve...'))) : onToggle}
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
          trackColor={{ false: '#333', true: THEME.colors.primary }}
          thumbColor={value ? '#000' : '#f4f3f4'}
          onValueChange={onToggle}
          value={value}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isArtist ? 'O Códice Profissional' : 'O Códice'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.categoryRow}>
          {categories.map((item) => {
            const selected = activeCategory === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.categoryChip, selected && styles.categoryChipActive]}
                onPress={() => setActiveCategory(item.id)}
              >
                <Ionicons name={item.icon} size={14} color={selected ? '#000' : THEME.colors.primary} />
                <Text style={[styles.categoryChipText, selected && styles.categoryChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showProfile && (!isArtist ? (
          <>
            <Text style={styles.sectionTitle}>Configuração de Perfil</Text>
            <View style={styles.sectionCardPad}>
              <Text style={styles.fieldLabel}>Resumo Atual do Perfil</Text>
              <Text style={styles.summaryLine}>Intenção: <Text style={styles.summaryHighlight}>{viewerIntentionLabel}</Text></Text>
              <Text style={styles.summaryLine}>Base: <Text style={styles.summaryHighlight}>{activeProfile?.city || 'Não definida'}</Text></Text>
              <Text style={styles.summaryLine}>Interesses principais:</Text>
              <View style={styles.summaryTagsRow}>
                {topInterests.length ? topInterests.map((item) => (
                  <View key={item} style={styles.summaryTag}>
                    <Text style={styles.summaryTagText}>{item}</Text>
                  </View>
                )) : (
                  <Text style={styles.helper}>Nenhum interesse definido ainda.</Text>
                )}
              </View>
              <Text style={styles.summaryTimestamp}>Última atualização: {lastProfileUpdateLabel}</Text>
            </View>
            <View style={styles.sectionCard}>
              <SettingItem icon="person-outline" label="Editar Perfil Completo" onPress={onEditProfile} />
              <SettingItem icon="wallet-outline" label="Métodos de Pagamento" />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Configuração de Perfil</Text>
            <View style={styles.sectionCardPad}>
              <Text style={styles.fieldLabel}>Resumo Atual do Perfil</Text>
              <Text style={styles.summaryLine}>Projeto: <Text style={styles.summaryHighlight}>{activeProfile?.name || 'Não definido'}</Text></Text>
              <Text style={styles.summaryLine}>Vibe: <Text style={styles.summaryHighlight}>{activeProfile?.vibe || 'Não definida'}</Text></Text>
              <Text style={styles.summaryLine}>Formação: <Text style={styles.summaryHighlight}>{activeProfile?.entity || 'Não definida'}</Text></Text>
              <Text style={styles.summaryLine}>Comunidade: <Text style={styles.summaryHighlight}>{activeProfile?.communityTitle || 'Não definida'}</Text></Text>
              <Text style={styles.summaryTimestamp}>Última atualização: {lastProfileUpdateLabel}</Text>
            </View>
            <View style={styles.sectionCard}>
              <SettingItem icon="create-outline" label="Editar Perfil Completo" onPress={onEditProfile} />
              <SettingItem icon="construct-outline" label="Rider Técnico Padrão" onPress={onEditProfile} />
              <SettingItem icon="link-outline" label="Links do Portfólio" onPress={onEditProfile} />
            </View>

            <Text style={styles.sectionTitle}>Operação Profissional</Text>
            <View style={styles.sectionCardPad}>
              <Text style={styles.fieldLabel}>Dados para Tributo (PIX / Conta)</Text>
              <TextInput
                value={pixKey}
                onChangeText={setPixKey}
                placeholder="Chave PIX"
                placeholderTextColor="#666"
                style={styles.input}
              />
              <TextInput
                value={bankData}
                onChangeText={setBankData}
                placeholder="Banco • Agência • Conta"
                placeholderTextColor="#666"
                style={styles.input}
              />

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Raio de Atuação: {radius} km</Text>
              <View style={styles.radiusRow}>
                {RADIUS_STEPS.map((step) => {
                  const active = radius === step;
                  return (
                    <TouchableOpacity
                      key={step}
                      style={[styles.radiusChip, active && styles.radiusChipActive]}
                      onPress={() => setRadius(step)}
                    >
                      <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>{step}km</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helper}>Define até onde você aceita viajar para chamados no feed.</Text>
            </View>

            <Text style={styles.sectionTitle}>Controle de Tempo</Text>
            <View style={styles.sectionCardPad}>
              <Text style={styles.fieldLabel}>Dias Sombrios (indisponível)</Text>
              <View style={styles.daysGrid}>
                {days.map((d) => {
                  const selected = blockedDays.includes(d.iso);
                  return (
                    <TouchableOpacity
                      key={d.iso}
                      style={[styles.dayCell, selected && styles.dayCellSelected]}
                      onPress={() => toggleBlockedDay(d.iso)}
                    >
                      <Text style={[styles.dayWeek, selected && styles.dayTextSelected]}>{d.weekDay}</Text>
                      <Text style={[styles.dayNum, selected && styles.dayTextSelected]}>{d.day}</Text>
                      <Text style={[styles.dayMonth, selected && styles.dayTextSelected]}>{d.month}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helper}>
                {blockedDays.length} dia(s) bloqueado(s). Bares não poderão enviar propostas nessas datas.
              </Text>
            </View>
          </>
        ))}

        {showSystem && (
          <>
            <Text style={styles.sectionTitle}>Configurações do Sistema</Text>
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

            <Text style={styles.sectionTitle}>Conselho</Text>
            <View style={styles.sectionCard}>
              <SettingItem icon="help-buoy-outline" label="Invocar Ajuda (Suporte)" />
              <SettingItem icon="document-text-outline" label="Pergaminhos da Lei (Termos)" />
              <SettingItem icon="star-outline" label="Avaliar o Portal" />
            </View>
          </>
        )}

        {showPrivacy && (
          <>
            <Text style={styles.sectionTitle}>Privacidade & Arquivo</Text>
            <View style={[styles.sectionCard, { marginBottom: 10 }]}>
              <SettingItem
                icon="eye-off-outline"
                label="Posts ocultados"
                onPress={onOpenHiddenPosts || (() => alert('Em breve...'))}
              />
            </View>

            <TouchableOpacity style={styles.privateToggle} onPress={() => setIsPrivateArchiveOpen((prev) => !prev)}>
              <View style={styles.privateToggleLeft}>
                <Ionicons name="lock-closed-outline" size={15} color={THEME.colors.primary} />
                <Text style={styles.privateToggleTitle}>Curtidas privadas</Text>
              </View>
              <Ionicons name={isPrivateArchiveOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#888" />
            </TouchableOpacity>

            {isPrivateArchiveOpen && (
              <View style={styles.sectionCardPad}>
                {likedPosts.length ? likedPosts.map((post) => (
                  <View key={`settings_liked_${post.id}`} style={styles.privateItem}>
                    <View style={styles.privateIconWrap}>
                      <Ionicons name="flame" size={14} color={THEME.colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.privateTitle} numberOfLines={1}>{post.title || post.author}</Text>
                      <Text style={styles.privateMeta} numberOfLines={1}>Curtido em {formatLikedAt(post.likedAt)}</Text>
                    </View>
                  </View>
                )) : (
                  <Text style={styles.helper}>Nenhum post curtido ainda.</Text>
                )}
              </View>
            )}
          </>
        )}

        {showSecurity && (
          <>
            <Text style={styles.sectionTitle}>Segurança da Conta</Text>
            <View style={styles.sectionCardPad}>
              <Text style={styles.fieldLabel}>Alterar Palavra-Passe</Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Senha atual"
                placeholderTextColor="#666"
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nova senha"
                placeholderTextColor="#666"
                secureTextEntry
                style={styles.input}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#666"
                secureTextEntry
                style={styles.input}
              />
              <View style={{ marginTop: 4 }}>
                <Button title="Salvar Nova Senha" type="secondary" onPress={handlePasswordUpdate} />
              </View>
              <Text style={styles.helper}>E-mail e CPF são dados imutáveis por segurança de conta.</Text>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="power" size={20} color="#8A0B0B" />
          <Text style={styles.logoutText}>Quebrar o Pacto (Sair)</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versão 0.7.0 (Beta)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontFamily: 'Cinzel_700Bold', fontSize: 24, color: THEME.colors.text },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontFamily: 'Cinzel_700Bold',
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
  sectionCardPad: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#121212',
  },
  categoryChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  categoryChipText: {
    marginLeft: 6,
    color: '#D0D0D0',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#000',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 200, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: { fontFamily: 'Lato_400Regular', color: '#DDD', fontSize: 16 },

  fieldLabel: { fontFamily: 'Lato_700Bold', color: THEME.colors.primary, marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: THEME.colors.secondary,
    color: THEME.colors.text,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Lato_400Regular',
    marginBottom: 10,
  },
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  radiusChip: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  radiusChipActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  radiusChipText: { color: '#CCC', fontFamily: 'Lato_700Bold', fontSize: 12 },
  radiusChipTextActive: { color: '#000' },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  dayCell: {
    width: '18%',
    minWidth: 58,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#141414',
  },
  dayCellSelected: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  dayWeek: { color: '#888', fontSize: 10, fontFamily: 'Lato_700Bold', textTransform: 'uppercase' },
  dayNum: { color: '#EEE', fontSize: 16, fontFamily: 'Cinzel_700Bold' },
  dayMonth: { color: '#888', fontSize: 10, fontFamily: 'Lato_400Regular', textTransform: 'uppercase' },
  dayTextSelected: { color: '#000' },

  helper: { color: '#666', fontFamily: 'Lato_400Regular', fontSize: 12, marginTop: 6 },
  summaryLine: {
    color: '#CFCFCF',
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    marginBottom: 6,
  },
  summaryHighlight: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
  },
  summaryTagsRow: {
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTag: {
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#111',
  },
  summaryTagText: {
    color: '#D8D8D8',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  summaryTimestamp: {
    marginTop: 10,
    color: '#7E7E7E',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
  },
  privateToggle: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    backgroundColor: '#161616',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privateToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privateToggleTitle: {
    color: '#D0D0D0',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  privateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#121212',
    marginBottom: 8,
  },
  privateIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  privateTitle: {
    color: '#E2E2E2',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  privateMeta: {
    marginTop: 2,
    color: '#888',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
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
  logoutText: { color: '#8A0B0B', fontFamily: 'Lato_700Bold', fontSize: 16, marginLeft: 8 },
  versionText: {
    textAlign: 'center',
    color: '#444',
    marginTop: 20,
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
  },
});