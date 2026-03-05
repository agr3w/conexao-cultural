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

function createCoordinatesFromSeed(seedText = '') {
    const seed = String(seedText || '')
        .split('')
        .reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) % 100000, 5381);

    const latOffset = ((seed % 21) - 10) * 0.0012;
    const lngOffset = (((Math.floor(seed / 21)) % 21) - 10) * 0.0012;

    return {
        latitude: DEFAULT_LATITUDE + latOffset,
        longitude: DEFAULT_LONGITUDE + lngOffset,
    };
}

function hasExplicitCoordinates(place = {}) {
    const latitude = Number(place?.latitude ?? place?.lat);
    const longitude = Number(place?.longitude ?? place?.lng);
    return Number.isFinite(latitude) && Number.isFinite(longitude);
}

function buildGeocodeQuery(place = {}) {
    const cepDigits = String(place?.cep || '').replace(/\D/g, '').trim();
    const chunks = [
        String(place?.street || '').trim(),
        String(place?.number || '').trim(),
        String(place?.district || '').trim(),
        String(place?.cityState || '').trim(),
        String(place?.address || '').trim(),
        String(place?.name || '').trim(),
        cepDigits,
        'Brasil',
    ].filter(Boolean);

    return chunks.join(', ');
}

async function resolveCoordinatesByAddress(place = {}) {
    const query = buildGeocodeQuery(place);
    if (!query) return null;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR',
                },
            }
        );

        if (!response.ok) return null;

        const payload = await response.json();
        const first = Array.isArray(payload) ? payload[0] : null;
        if (!first) return null;

        const latitude = Number(first.lat);
        const longitude = Number(first.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

        return { latitude, longitude };
    } catch {
        return null;
    }
}

function normalizePlaceInput(place = {}) {
    const fallbackCoords = createCoordinatesFromSeed(`${place?.name || ''}_${place?.address || ''}`);
    const latitude = toNumber(place?.latitude ?? place?.lat, fallbackCoords.latitude);
    const longitude = toNumber(place?.longitude ?? place?.lng, fallbackCoords.longitude);

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

export async function createNewPlace(placeData = {}) {
    let sourcePlace = {
        ...placeData,
        id: placeData?.id || `pl_${Date.now()}`,
    };

    if (!hasExplicitCoordinates(sourcePlace)) {
        const geocoded = await resolveCoordinatesByAddress(sourcePlace);
        if (geocoded) {
            sourcePlace = {
                ...sourcePlace,
                latitude: geocoded.latitude,
                longitude: geocoded.longitude,
            };
        }
    }

    const normalized = normalizePlaceInput(sourcePlace);

    if (!normalized.name) {
        throw new Error('Informe o nome do local.');
    }

    if (!normalized.address) {
        throw new Error('Informe o endereço do local.');
    }

    PLACES.unshift(normalized);
    return { ...normalized };
}