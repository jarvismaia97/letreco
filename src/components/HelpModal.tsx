import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HelpModal({ visible, onClose }: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.colors.modalOverlay }]}>
        <View style={[styles.modal, { backgroundColor: theme.colors.modalBg }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeTxt, { color: theme.colors.text }]}>✕</Text>
          </TouchableOpacity>
          <ScrollView>
            <Text style={[styles.title, { color: theme.colors.text }]}>COMO JOGAR</Text>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              Adivinha a palavra em 6 tentativas.
            </Text>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              Cada tentativa deve ser uma palavra válida em português. Carrega em ENTER para submeter.
            </Text>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              Após cada tentativa, as cores das letras mudam para mostrar o quão perto estás da palavra certa.
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.text }]}>Exemplos</Text>

            <View style={styles.exampleRow}>
              <View style={[styles.tile, { backgroundColor: theme.colors.correct, borderColor: theme.colors.border }]}>
                <Text style={[styles.tileLetter, { color: theme.colors.text }]}>P</Text>
              </View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>R</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>A</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>T</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>O</Text></View>
            </View>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              A letra <Text style={{ fontWeight: 'bold', color: theme.colors.correct }}>P</Text> está na palavra e na posição correta.
            </Text>

            <View style={styles.exampleRow}>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>F</Text></View>
              <View style={[styles.tile, { backgroundColor: theme.colors.present, borderColor: theme.colors.border }]}>
                <Text style={[styles.tileLetter, { color: theme.colors.text }]}>E</Text>
              </View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>S</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>T</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>A</Text></View>
            </View>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              A letra <Text style={{ fontWeight: 'bold', color: theme.colors.present }}>E</Text> está na palavra mas na posição errada.
            </Text>

            <View style={styles.exampleRow}>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>M</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>U</Text></View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>N</Text></View>
              <View style={[styles.tile, { backgroundColor: theme.colors.absent, borderColor: theme.colors.border }]}>
                <Text style={[styles.tileLetter, { color: theme.colors.text }]}>D</Text>
              </View>
              <View style={[styles.tile, { borderColor: theme.colors.border }]}><Text style={[styles.tileLetter, { color: theme.colors.text }]}>O</Text></View>
            </View>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              A letra <Text style={{ fontWeight: 'bold', color: theme.colors.lightGray }}>D</Text> não está na palavra.
            </Text>

            <Text style={[styles.text, { marginTop: 16, color: theme.colors.lightGray }]}>
              Uma nova palavra fica disponível todos os dias! Escolhe entre modos de 4, 5, 6 ou 7 letras.
            </Text>
            <Text style={[styles.text, { color: theme.colors.lightGray }]}>
              Os acentos são preenchidos automaticamente — escreve sem acentos.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  closeTxt: { fontSize: 20 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  tile: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 4,
  },
  tileLetter: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
