import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from './src/styles/colors';
import Input from './src/components/Input';
import Button from './src/components/Button';

export default function App() {
  let [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Lato_400Regular,
    Lato_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={THEME.colors.primary} />;
  }

  return (
    // KeyboardAvoidingView: Empurra a tela pra cima quando o teclado abre
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* --- ÁREA DO LOGO --- */}
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={64} color={THEME.colors.primary} />
        <Text style={styles.title}>CONEXÃO{'\n'}CULTURAL</Text>
        <Text style={styles.subtitle}>Onde o caos encontra a arte</Text>
      </View>

      {/* --- ÁREA DO FORMULÁRIO --- */}
      <View style={styles.form}>
        <Input
          label="Codinome"
          placeholder="Digite seu e-mail"
        />
        <Input
          label="Palavra-chave"
          placeholder="Digite sua senha"
          secureTextEntry
        />

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueceu suas credenciais?</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />

        <Button title="Entrar no Portal" type="primary" onPress={() => alert('Entrando...')} />
        <Button title="Criar novo Pacto" type="secondary" onPress={() => alert('Cadastro')} />
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 32,
    color: THEME.colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'Lato_400Regular',
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    color: '#666',
    textAlign: 'right',
    fontFamily: 'Lato_400Regular',
    marginBottom: 24,
  }
});