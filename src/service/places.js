const ALLOWED_PLACE_TYPES = ['bar', 'teatro', 'rua'];
const DEFAULT_LATITUDE = -25.4284;
const DEFAULT_LONGITUDE = -49.2733;

function normalizePlaceType(value = '') {
    const normalized = String(value || '').trim().toLowerCase();
    if (ALLOWED_PLACE_TYPES.includes(normalized)) return normalized;
    return 'bar';
}

function toNumber(value, fallback) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    return fallback;
}

function normalizePlaceInput(place = {}) {
    const latitude = toNumber(place?.latitude ?? place?.lat, DEFAULT_LATITUDE);
    const longitude = toNumber(place?.longitude ?? place?.lng, DEFAULT_LONGITUDE);

    return {
        id: String(place?.id || `pl_${Date.now()}`),
        name: String(place?.name || '').trim(),
        address: String(place?.address || '').trim(),
        type: normalizePlaceType(place?.type),
        latitude,
        longitude,
        lat: latitude,
        lng: longitude,
        vibe: String(place?.vibe || '').trim(),
        heat: String(place?.heat || '').trim(),
        image: place?.image || undefined,
        category: String(place?.category || '').trim(),
        description: String(place?.description || '').trim(),
        nextEvent: String(place?.nextEvent || '').trim(),
        capacity: toNumber(place?.capacity, 0),
    };
}

export const PLACES = [
    normalizePlaceInput({
        id: '202',
        type: 'bar',
        name: 'Porão do Jazz',
        vibe: 'Melancolia',
        heat: 'Morno',
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800',
        category: 'Local / Santuário',
        address: 'Centro Histórico, Curitiba - PR',
        description: 'Ambiente intimista com jazz noir, luz baixa e carta especial de drinks.',
        nextEvent: 'Sexta-feira • 22:00',
        capacity: 180,
        latitude: -25.4284,
        longitude: -49.2733,
    }),
    normalizePlaceInput({
        id: '204',
        type: 'bar',
        name: 'Inferno Club',
        vibe: 'Euforia',
        heat: 'Ardendo',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800',
        category: 'Casa de Show',
        address: 'Rua das Brasas, 147 - Curitiba - PR',
        description: 'Pista intensa, line-up pesado e noites de alta energia.',
        nextEvent: 'Sábado • 23:30',
        capacity: 420,
        latitude: -25.4354,
        longitude: -49.2713,
    }),
    normalizePlaceInput({
        id: '301',
        type: 'teatro',
        name: 'Teatro das Sombras',
        vibe: 'Sombras',
        heat: 'Frio',
        image: 'https://images.unsplash.com/photo-1503095392237-fc70339a2881?q=80&w=800',
        category: 'Teatro',
        address: 'Alameda das Máscaras, 90 - Curitiba - PR',
        description: 'Espaço para peças experimentais e performances autorais.',
        nextEvent: 'Domingo • 20:00',
        capacity: 260,
        latitude: -25.44,
        longitude: -49.28,
    }),
];

export function getAllPlaces() {
    return PLACES.map((place) => ({ ...place }));
}

export function getPlaceById(id) {
    if (!id) return null;
    const found = PLACES.find((place) => place.id === String(id));
    return found ? { ...found } : null;
}

export function createNewPlace(placeData = {}) {
    const normalized = normalizePlaceInput({
        ...placeData,
        id: placeData?.id || `pl_${Date.now()}`,
    });

    if (!normalized.name) {
        throw new Error('Informe o nome do local.');
    }

    if (!normalized.address) {
        throw new Error('Informe o endereço do local.');
    }

    PLACES.unshift(normalized);
    return { ...normalized };
}