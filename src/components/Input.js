import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { THEME } from '../styles/colors';

export default function Input({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines,
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  label: {
    fontFamily: 'Lato_700Bold',
    color: THEME.colors.primary,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: THEME.colors.secondary,
    color: THEME.colors.text,
    fontFamily: 'Lato_400Regular',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
});