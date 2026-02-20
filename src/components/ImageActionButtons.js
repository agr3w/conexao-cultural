import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

export default function ImageActionButtons({
  onPickLibrary,
  onPickCamera,
  onRemove,
  showRemove = true,
}) {
  return (
    <View style={styles.row}>
      <ActionButton icon="images-outline" label="Galeria" onPress={onPickLibrary} />
      <ActionButton icon="camera-outline" label="Câmera" onPress={onPickCamera} />
      {showRemove && <ActionButton icon="trash-outline" label="Remover" onPress={onRemove} destructive />}
    </View>
  );
}

function ActionButton({ icon, label, onPress, destructive = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, destructive && styles.buttonDestructive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={14} color={destructive ? '#E8B4B4' : '#000'} />
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: THEME.colors.primary,
  },
  buttonDestructive: {
    backgroundColor: 'rgba(138, 11, 11, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(232, 180, 180, 0.35)',
  },
  label: {
    marginLeft: 6,
    color: '#000',
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
  },
  labelDestructive: {
    color: '#E8B4B4',
  },
});
