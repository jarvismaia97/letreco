# 🇵🇹 Letreco

Jogo de palavras em Português Europeu, inspirado no Wordle.

## Como Jogar

- Adivinha a palavra do dia em **6 tentativas**
- Escolhe entre modos de **4, 5, 6 ou 7 letras**
- Após cada tentativa, as cores indicam:
  - 🟩 **Verde** — letra certa na posição certa
  - 🟨 **Amarelo** — letra certa na posição errada
  - ⬛ **Cinzento** — letra não está na palavra
- Os acentos são preenchidos automaticamente
- Uma nova palavra por dia em cada modo!

## Executar

```bash
# Instalar dependências
bun install

# Web
npx expo start --web

# Mobile
npx expo start
```

## Tecnologias

- React Native + Expo (TypeScript)
- AsyncStorage para estatísticas
- Suporte web e mobile responsivo

## Funcionalidades

- 4 modos de jogo (4-7 letras)
- Animações de revelação
- Teclado virtual QWERTY com Ç
- Estatísticas por modo (jogos, vitórias, sequência)
- Partilha de resultados em emoji
- Tema escuro
