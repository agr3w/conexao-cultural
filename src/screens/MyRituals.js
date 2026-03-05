import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';
import { cancelAgendaCommitment, getAgendaSections, getAgendaStats, markAgendaCommitmentDone } from '../service/agenda';

function getStatusMeta(status = 'aguardando', sourceType = 'event') {
  if (status === 'confirmado') return { label: 'CONFIRMADO', color: THEME.colors.primary };
  if (status === 'lista_espera') return { label: 'LISTA DE ESPERA', color: '#95A5A6' };
  if (status === 'concluido') return { label: 'CONCLUÍDO', color: '#2ecc71' };
  if (status === 'cancelado') return { label: 'CANCELADO', color: '#e74c3c' };
  if (status === 'aguardando' && sourceType === 'gig') return { label: 'AGUARDANDO APROVAÇÃO', color: '#e67e22' };
  return { label: 'AGUARDANDO', color: '#e67e22' };
}

function hasCommitmentStarted(item) {
  const startAt = Date.parse(String(item?.startAt || ''));
  if (Number.isNaN(startAt)) return false;
  return Date.now() >= startAt;
}

function canConcludeCommitment(item, isArtist) {
  if (!item) return false;
  if (item.status === 'concluido' || item.status === 'cancelado') return false;

  if (!isArtist) return true;

  return item.sourceType === 'gig'
    && item.status === 'confirmado'
    && hasCommitmentStarted(item);
}

export default function MyRituals({
  onBack,
  userProfile = 'viewer',
  ownerUserId,
  refreshTick = 0,
  onAgendaChanged,
  onOpenCommitment,
}) {
  const isArtist = userProfile === 'artist';
  const [tab, setTab] = useState('upcoming');

  const sections = useMemo(
    () => getAgendaSections(ownerUserId, userProfile),
    [ownerUserId, userProfile, refreshTick]
  );
  const stats = useMemo(
    () => getAgendaStats(ownerUserId, userProfile),
    [ownerUserId, userProfile, refreshTick]
  );

  const data = tab === 'upcoming' ? sections.upcoming : sections.history;

  const markDone = (item) => {
    if (isArtist && !canConcludeCommitment(item, true)) {
      alert('A conclusão só é liberada após aprovação do anfitrião e no horário do show.');
      return;
    }

    try {
      markAgendaCommitmentDone(item.id, ownerUserId);
      onAgendaChanged?.();
      alert('Compromisso marcado como concluído.');
    } catch (error) {
      alert(error?.message || 'Não foi possível atualizar este compromisso.');
    }
  };

  const cancelPresence = (item) => {
    try {
      cancelAgendaCommitment({
        ownerUserId,
        commitmentId: item.id,
      });
      onAgendaChanged?.();
      alert('Presença cancelada.');
    } catch (error) {
      alert(error?.message || 'Não foi possível cancelar este compromisso.');
    }
  };

  const renderCommitment = ({ item }) => {
    const statusMeta = getStatusMeta(item.status, item.sourceType);
    const canConclude = canConcludeCommitment(item, isArtist);
    const canCancelConfirmedEvent = item.sourceType === 'event' && item.status === 'confirmado';
    const canCancelWaitlistedEvent = item.sourceType === 'event' && item.status === 'lista_espera';
    const hasActions = tab === 'upcoming' && item.status !== 'concluido' && (
      canCancelConfirmedEvent || canCancelWaitlistedEvent || canConclude
    );

    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardTapArea} activeOpacity={0.92} onPress={() => onOpenCommitment?.(item)}>
          <View style={styles.cardTop}>
            <View style={[styles.typeBadge, item.sourceType === 'gig' && styles.typeBadgeGig]}>
              <Text style={styles.typeBadgeText}>{item.sourceType === 'gig' ? 'CHAMADO' : 'EVENTO'}</Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: statusMeta.color }]}>
              <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.rowText}>{item.dateLabel || 'Data a definir'}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.rowText}>{item.place || 'Local a definir'}</Text>
          </View>

          {!!item.cache && (
            <View style={styles.row}>
              <Ionicons name="cash-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.rowText}>Tributo: {item.cache}</Text>
            </View>
          )}

          <Text style={[styles.roleText, { marginTop: 12 }]}>{item.role === 'artist' ? 'Missão de palco' : 'Presença no ritual'}</Text>
        </TouchableOpacity>

        <View style={styles.cardFooter}>
          <Text style={styles.openHint}>Toque no card para ver detalhes</Text>

          {hasActions && (
            <View style={styles.cardActions}>
              {canCancelConfirmedEvent && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelPresence(item)}>
                  <Text style={styles.cancelButtonText}>Cancelar presença</Text>
                </TouchableOpacity>
              )}

              {canCancelWaitlistedEvent && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelPresence(item)}>
                  <Text style={styles.cancelButtonText}>Sair da lista de espera</Text>
                </TouchableOpacity>
              )}

              {canConclude && (
                <TouchableOpacity style={styles.doneButton} onPress={() => markDone(item)}>
                  <Text style={styles.doneButtonText}>Concluir</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isArtist ? 'Agenda de Missões' : 'Agenda de Rituais'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>Próximos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.history}</Text>
          <Text style={styles.statLabel}>Histórico</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tab, tab === 'upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>Próximos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCommitment}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {tab === 'upcoming'
              ? 'Sem compromissos ainda. Confirme presença em eventos ou aceite chamados no feed.'
              : 'Seu histórico de compromissos aparece aqui.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 22,
    color: THEME.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    borderRadius: 10,
    backgroundColor: '#151515',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    fontSize: 18,
  },
  statLabel: {
    marginTop: 2,
    color: '#8C8C8C',
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#383838',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  tabActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    color: '#CFCFCF',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#000',
  },
  listContent: {
    padding: 16,
    paddingBottom: 22,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'Lato_400Regular',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
  },
  cardTapArea: {
    borderRadius: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#474747',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#141414',
  },
  typeBadgeGig: {
    borderColor: THEME.colors.primary,
  },
  typeBadgeText: {
    color: '#B2B2B2',
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  cardTitle: {
    marginTop: 10,
    color: '#F0F0F0',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rowText: {
    marginLeft: 8,
    color: '#DDD',
    fontFamily: 'Lato_400Regular',
    flex: 1,
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleText: {
    color: '#8A8A8A',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
  openHint: {
    color: '#707070',
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
  },
  doneButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#5A5A5A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D0D0D0',
    fontFamily: 'Lato_700Bold',
    fontSize: 11,
  },
});