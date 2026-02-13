import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { THEME } from './src/styles/colors';

export default function App() {
  // Carregando as fontes antes de abrir o app
  let [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  // Enquanto a fonte não carrega, mostra um loading
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONEXÃO CULTURAL</Text>
      <Text style={styles.subtitle}>Onde o caos encontra a arte</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background, // Fundo #0F0F0F
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Cinzel_700Bold', // Fonte Mística
    fontSize: 32,
    color: THEME.colors.primary, // Amarelo Rei
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: THEME.colors.text,
    opacity: 0.7,
  },
});