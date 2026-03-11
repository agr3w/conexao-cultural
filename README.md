
# Conexão Cultural 🎸📱

> Projeto acadêmico desenvolvido para o 5º Semestre de Análise e Desenvolvimento de Sistemas (ADS) da UNIFACEAR - 2026.

## 📖 Sobre o Projeto

O **Conexão Cultural** é uma aplicação mobile desenvolvida com **React Native** e **Expo**. A proposta é criar uma plataforma para conectar pessoas a eventos e experiências culturais, utilizando recursos como feed interativo, mapas e detalhes de eventos.

Este projeto foi criado como parte da avaliação semestral, focando na arquitetura de aplicativos móveis e experiência do usuário.

---

## 🚀 Como rodar a aplicação

Para executar este projeto localmente, você precisará de algumas ferramentas instaladas no seu computador.

### 1️⃣ Pré-requisitos (O que instalar antes)

* **Node.js**: O ambiente de execução para JavaScript.
    * *Como saber se tenho?* Abra o terminal e digite `node -v`. Se aparecer uma versão (ex: v18.x ou v20.x), está tudo certo.
    * *Não tem?* Baixe e instale a versão **LTS** aqui: [nodejs.org](https://nodejs.org/)
* **Git**: Para clonar o repositório (opcional se você baixou o ZIP).
* **Expo Go (No seu Celular)**:
    * Baixe o aplicativo **Expo Go** na Google Play Store (Android) ou App Store (iOS). É através dele que você verá o app rodando no seu telefone.

### 2️⃣ Instalação

Abra o seu terminal (CMD, PowerShell ou Terminal do VS Code) na pasta do projeto e execute o comando abaixo para instalar todas as dependências listadas no projeto:

```bash
npm install
# ou
npx expo install

```

> **Nota:** Isso vai ler o arquivo `package.json` e baixar bibliotecas como `react-native-maps`, `expo-linear-gradient` e fontes do Google.

### 3️⃣ Executando o Projeto

Após a instalação terminar, inicie o servidor de desenvolvimento com o comando:

Bash

```
npx expo start
```

### 4️⃣ Visualizando no Celular

Assim que você rodar o comando acima, um **QR Code** aparecerá no seu terminal (e abrirá uma janela no navegador mostrando o Metro Bundler).

1.  Abra o app **Expo Go** no seu celular.

2.  **Android:** Toque em *"Scan QR Code"* e aponte a câmera para o terminal.

3.  **iOS:** Use o aplicativo de Câmera padrão do iPhone para ler o QR Code (ele vai sugerir abrir no Expo).

4.  Aguarde o carregamento do bundle JavaScript (pode demorar um pouco na primeira vez).

* * * * *

🖥️ Rodando em Emuladores (Opcional)
------------------------------------

Se preferir rodar no computador sem usar o celular:

-   **Pressione `a`** no terminal após o `npx expo start` para abrir no **Emulador Android** (requer Android Studio configurado).

-   **Pressione `i`** no terminal para abrir no **Simulador iOS** (requer Xcode e um Mac).

-   **Pressione `w`** para rodar a versão **Web** no navegador.

* * * * *

🛠️ Tecnologias Utilizadas
--------------------------

-   **React Native** (0.81.5)

-   **Expo** (~54.0.33)

-   **React Navigation** (Estrutura de navegação)

-   **Expo Google Fonts** (Cinzel e Lato)

-   **React Native Maps** (Integração com mapas)
