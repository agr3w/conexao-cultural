import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

export default function ArtistInsights({ onBack }) {
    const kpis = [
        { id: 'k1', label: 'Visitas de Bares (7d)', value: '42', delta: '+18%' },
        { id: 'k2', label: 'Propostas Recebidas', value: '11', delta: '+3' },
        { id: 'k3', label: 'Shows Fechados (mês)', value: '8', delta: '+2' },
        { id: 'k4', label: 'Faturamento no App', value: 'R$ 6.300', delta: '+12%' },
    ];

    const funnel = [
        { stage: 'Visitas de bares', value: 42, color: '#8a8a8a' },
        { stage: 'Conversas iniciadas', value: 17, color: '#4e6e8e' },
        { stage: 'Propostas enviadas', value: 11, color: '#e67e22' },
        { stage: 'Contratos fechados', value: 8, color: THEME.colors.primary },
    ];

    const maxFunnel = Math.max(...funnel.map((item) => item.value));

    const topBars = [
        { name: 'Porão do Jazz', jobs: 3, revenue: 'R$ 2.450' },
        { name: 'Inferno Club', jobs: 2, revenue: 'R$ 1.800' },
        { name: 'Teatro das Sombras', jobs: 1, revenue: 'R$ 900' },
    ];

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.back}>
                <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Olho Que Tudo Vê</Text>
                <Text style={styles.subtitle}>Painel comercial para monitorar captação, conversão e receita.</Text>

                <View style={styles.periodRow}>
                    <PeriodChip label="7 dias" active />
                    <PeriodChip label="30 dias" />
                    <PeriodChip label="90 dias" />
                </View>

                <View style={styles.kpiGrid}>
                    {kpis.map((kpi) => (
                        <View key={kpi.id} style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>{kpi.label}</Text>
                            <Text style={styles.kpiValue}>{kpi.value}</Text>
                            <Text style={styles.kpiDelta}>{kpi.delta}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Funil de Fechamento</Text>
                <View style={styles.card}>
                    {funnel.map((item) => (
                        <View key={item.stage} style={styles.funnelRow}>
                            <Text style={styles.funnelLabel}>{item.stage}</Text>
                            <View style={styles.funnelTrack}>
                                <View
                                    style={[
                                        styles.funnelBar,
                                        {
                                            backgroundColor: item.color,
                                            width: `${Math.max(18, (item.value / maxFunnel) * 100)}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.funnelValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Tavernas com Melhor Retorno</Text>
                <View style={styles.card}>
                    {topBars.map((bar) => (
                        <View key={bar.name} style={styles.rankRow}>
                            <View>
                                <Text style={styles.rankName}>{bar.name}</Text>
                                <Text style={styles.rankSub}>{bar.jobs} shows fechados</Text>
                            </View>
                            <Text style={styles.rankRevenue}>{bar.revenue}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Financeiro Imediato</Text>
                <View style={styles.card}>
                    <InfoRow icon="cash-outline" label="A receber (próx. 7 dias)" value="R$ 1.800" />
                    <InfoRow icon="time-outline" label="Pagamento pendente" value="2 contratos" />
                    <InfoRow icon="shield-checkmark-outline" label="Taxa de conclusão" value="89%" />
                </View>

                <Text style={styles.sectionTitle}>Como Ler Este Painel</Text>
                <View style={styles.card}>
                    <Text style={styles.tip}>• Se visitas subirem e propostas não subirem, ajuste bio/rider e mídia.</Text>
                    <Text style={styles.tip}>• Se propostas subirem e fechamentos caírem, revise cachê e raio de atuação.</Text>
                    <Text style={styles.tip}>• Foque nas tavernas com maior retorno por show para aumentar margem.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function PeriodChip({ label, active = false }) {
    return (
        <TouchableOpacity style={[styles.periodChip, active && styles.periodChipActive]}>
            <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
                <Ionicons name={icon} size={16} color={THEME.colors.primary} />
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background, padding: 20, paddingTop: 50 },
    content: { paddingBottom: 40 },
    back: { marginBottom: 10 },
    title: { fontFamily: 'Cinzel_700Bold', color: THEME.colors.primary, fontSize: 24 },
    subtitle: { color: '#A0A0A0', fontFamily: 'Lato_400Regular', marginTop: 6, marginBottom: 14 },
    periodRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    periodChip: {
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 18,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    periodChipActive: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    periodChipText: { color: '#CCC', fontFamily: 'Lato_700Bold', fontSize: 12 },
    periodChipTextActive: { color: '#000' },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    kpiCard: {
        width: '48%',
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    kpiLabel: { color: '#9D9D9D', fontFamily: 'Lato_400Regular', fontSize: 12 },
    kpiValue: { color: '#EEE', fontFamily: 'Cinzel_700Bold', fontSize: 20, marginTop: 4 },
    kpiDelta: { color: THEME.colors.primary, fontFamily: 'Lato_700Bold', fontSize: 12, marginTop: 2 },
    sectionTitle: {
        color: THEME.colors.primary,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#141414',
        borderWidth: 1,
        borderColor: '#2f2f2f',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    funnelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    funnelLabel: {
        width: 120,
        color: '#BBB',
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
    },
    funnelTrack: {
        flex: 1,
        height: 10,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
        overflow: 'hidden',
        marginHorizontal: 8,
    },
    funnelBar: {
        height: '100%',
        borderRadius: 8,
    },
    funnelValue: {
        width: 26,
        textAlign: 'right',
        color: '#DDD',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
    },
    rankRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#252525',
        paddingVertical: 8,
    },
    rankName: {
        color: '#EEE',
        fontFamily: 'Lato_700Bold',
    },
    rankSub: {
        color: '#8A8A8A',
        fontFamily: 'Lato_400Regular',
        fontSize: 12,
        marginTop: 2,
    },
    rankRevenue: {
        color: THEME.colors.primary,
        fontFamily: 'Lato_700Bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        marginLeft: 8,
        color: '#CCC',
        fontFamily: 'Lato_400Regular',
    },
    infoValue: {
        color: '#EEE',
        fontFamily: 'Lato_700Bold',
    },
    tip: {
        color: '#A9A9A9',
        fontFamily: 'Lato_400Regular',
        marginBottom: 6,
        lineHeight: 18,
    },
});