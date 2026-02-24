import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../styles/colors';

export default function BottomMenu({ currentScreen, onChangeScreen, hidden = false }) {
  const containerAnim = useRef(new Animated.Value(hidden ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(containerAnim, {
      toValue: hidden ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, containerAnim]);
  
  // Função auxiliar para renderizar botões
  const MenuButton = ({ screenName, iconName, label }) => {
    const isActive = currentScreen === screenName;
    const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
      Animated.spring(activeAnim, {
        toValue: isActive ? 1 : 0,
        friction: 8,
        tension: 85,
        useNativeDriver: true,
      }).start();
    }, [isActive, activeAnim]);

    const iconScale = activeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.13],
    });

    const labelOpacity = activeAnim;
    const labelTranslate = activeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 0],
    });

    return (
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => onChangeScreen(screenName)}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons 
            name={isActive ? iconName : `${iconName}-outline`} 
            size={26} 
            color={isActive ? THEME.colors.primary : '#666'} 
          />
        </Animated.View>
        <Animated.Text
          style={[
            styles.label,
            {
              opacity: labelOpacity,
              transform: [{ translateY: labelTranslate }],
              maxHeight: isActive ? 14 : 0,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{
            translateY: containerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 92],
            }),
          }],
          opacity: containerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        },
      ]}
      pointerEvents={hidden ? 'none' : 'auto'}
    >
      <MenuButton screenName="FEED" iconName="home" label="O Caos" />
      <MenuButton screenName="ORACLE" iconName="search" label="Oráculo" />
      <MenuButton screenName="MAP" iconName="map" label="Radar" />
      <MenuButton screenName="USER_PROFILE" iconName="person" label="Grimório" />
    </Animated.View>
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
    overflow: 'hidden',
  }
});