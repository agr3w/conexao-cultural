import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

export default function BottomMenu({ currentScreen, onChangeScreen }) {
  
  // Função auxiliar para renderizar botões
  const MenuButton = ({ screenName, iconName, label }) => {
    const isActive = currentScreen === screenName;
    return (
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => onChangeScreen(screenName)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isActive ? iconName : `${iconName}-outline`} 
          size={26} 
          color={isActive ? THEME.colors.primary : '#666'} 
        />
        {/* Opcional: Mostrar label só se estiver ativo ou sempre */}
        {isActive && <Text style={styles.label}>{label}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MenuButton screenName="FEED" iconName="home" label="O Caos" />
      <MenuButton screenName="ORACLE" iconName="search" label="Oráculo" />
      <MenuButton screenName="MAP" iconName="map" label="Radar" />
      <MenuButton screenName="USER_PROFILE" iconName="person" label="Grimório" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // Altura da barra
    backgroundColor: '#0F0F0F', // Fundo escuro
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10, // Espaço seguro para iPhone X+
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: THEME.colors.primary,
    fontFamily: 'Lato_700Bold',
    marginTop: 4,
  }
});