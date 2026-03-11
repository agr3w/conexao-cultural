import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../styles/colors';

export const FALLBACK_AVATAR_STYLES = [
  { id: 'sigil', label: 'Sigilo', icon: 'person' },
  { id: 'neon', label: 'Neon', icon: 'flash' },
  { id: 'minimal', label: 'Minimal', icon: 'ellipse' },
];

function getInitials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return 'CC';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function ProfileAvatar({
  uri,
  name,
  variant = 'sigil',
  size = 80,
  borderWidth = 2,
  borderColor = THEME.colors.primary,
  style,
}) {
  const [imageError, setImageError] = useState(false);
  const shouldShowImage = Boolean(uri && !imageError);
  const initials = useMemo(() => getInitials(name), [name]);

  useEffect(() => {
    setImageError(false);
  }, [uri]);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    overflow: 'hidden',
  };

  if (shouldShowImage) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  if (variant === 'minimal') {
    return (
      <View style={[containerStyle, styles.minimalFallback, style]}>
        <Text style={styles.minimalInitials}>{initials}</Text>
      </View>
    );
  }

  if (variant === 'neon') {
    return (
      <LinearGradient
        colors={['#24143B', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[containerStyle, styles.fallback, style]}
      >
        <View style={styles.neonRing}>
          <Ionicons name="flash" size={Math.round(size * 0.32)} color={THEME.colors.primary} />
        </View>
        <Text style={styles.neonInitials}>{initials}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#242424', '#0F0F0F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[containerStyle, styles.fallback, style]}
    >
      <Ionicons name="person" size={Math.round(size * 0.34)} color={THEME.colors.primary} />
      <View style={styles.initialsBadge}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  minimalFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#171717',
  },
  minimalInitials: {
    color: '#CFCFCF',
    fontFamily: 'Cinzel_700Bold',
    fontSize: 20,
    letterSpacing: 1,
  },
  neonRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonInitials: {
    position: 'absolute',
    bottom: 6,
    color: '#F6D57A',
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  initialsBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    minWidth: 20,
    paddingHorizontal: 4,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 9,
  },
});
