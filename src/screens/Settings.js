import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

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

export default function Settings({ onBack, onLogout, userProfile = 'viewer' }) {
  const isArtist = userProfile === 'artist';

  // Público
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  // Artista
  const [pixKey, setPixKey] = useState('');
  const [bankData, setBankData] = useState('');
  const [radius, setRadius] = useState(50);
  const [blockedDays, setBlockedDays] = useState([]);
  const days = useMemo(() => buildNextDays(30), []);

  const toggleBlockedDay = (iso) => {
    setBlockedDays((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  };

  const SettingItem = ({ icon, label, type = 'arrow', value, onToggle }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={type === 'switch' ? 1 : 0.7}
      onPress={type === 'arrow' ? () => alert('Em breve...') : onToggle}
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
        {!isArtist ? (
          <>
            <Text style={styles.sectionTitle}>Sua Lenda</Text>
            <View style={styles.sectionCard}>
              <SettingItem icon="person-outline" label="Reescrever História (Editar Perfil)" />
              <SettingItem icon="key-outline" label="Alterar Palavra-Passe (Senha)" />
              <SettingItem icon="wallet-outline" label="Métodos de Pagamento" />
            </View>

            <Text style={styles.sectionTitle}>Preferências do Ritual</Text>
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
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>A Lenda</Text>
            <View style={styles.sectionCard}>
              <SettingItem icon="create-outline" label="Editar Bio Pública" />
              <SettingItem icon="construct-outline" label="Rider Técnico Padrão" />
              <SettingItem icon="link-outline" label="Links do Portfólio" />
            </View>

            <Text style={styles.sectionTitle}>Mercantil</Text>
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
        )}

        <Text style={styles.sectionTitle}>O Conselho</Text>
        <View style={styles.sectionCard}>
          <SettingItem icon="help-buoy-outline" label="Invocar Ajuda (Suporte)" />
          <SettingItem icon="document-text-outline" label="Pergaminhos da Lei (Termos)" />
          <SettingItem icon="star-outline" label="Avaliar o Portal" />
        </View>

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