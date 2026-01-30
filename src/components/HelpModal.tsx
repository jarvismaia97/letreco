import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HelpModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
          <ScrollView>
            <Text style={styles.title}>COMO JOGAR</Text>
            <Text style={styles.text}>
              Adivinha a palavra em 6 tentativas.
            </Text>
            <Text style={styles.text}>
              Cada tentativa deve ser uma palavra válida em português. Carrega em ENTER para submeter.
            </Text>
            <Text style={styles.text}>
              Após cada tentativa, as cores das letras mudam para mostrar o quão perto estás da palavra certa.
            </Text>

            <Text style={styles.subtitle}>Exemplos</Text>

            <View style={styles.exampleRow}>
              <View style={[styles.tile, { backgroundColor: COLORS.correct }]}>
                <Text style={styles.tileLetter}>P</Text>
              </View>
              <View style={styles.tile}><Text style={styles.tileLetter}>R</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>A</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>T</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>O</Text></View>
            </View>
            <Text style={styles.text}>
              A letra <Text style={{ fontWeight: 'bold', color: COLORS.correct }}>P</Text> está na palavra e na posição correta.
            </Text>

            <View style={styles.exampleRow}>
              <View style={styles.tile}><Text style={styles.tileLetter}>F</Text></View>
              <View style={[styles.tile, { backgroundColor: COLORS.present }]}>
                <Text style={styles.tileLetter}>E</Text>
              </View>
              <View style={styles.tile}><Text style={styles.tileLetter}>S</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>T</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>A</Text></View>
            </View>
            <Text style={styles.text}>
              A letra <Text style={{ fontWeight: 'bold', color: COLORS.present }}>E</Text> está na palavra mas na posição errada.
            </Text>

            <View style={styles.exampleRow}>
              <View style={styles.tile}><Text style={styles.tileLetter}>M</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>U</Text></View>
              <View style={styles.tile}><Text style={styles.tileLetter}>N</Text></View>
              <View style={[styles.tile, { backgroundColor: COLORS.absent }]}>
                <Text style={styles.tileLetter}>D</Text>
              </View>
              <View style={styles.tile}><Text style={styles.tileLetter}>O</Text></View>
            </View>
            <Text style={styles.text}>
              A letra <Text style={{ fontWeight: 'bold', color: COLORS.lightGray }}>D</Text> não está na palavra.
            </Text>

            <Text style={[styles.text, { marginTop: 16 }]}>
              Uma nova palavra fica disponível todos os dias! Escolhe entre modos de 4, 5, 6 ou 7 letras.
            </Text>
            <Text style={styles.text}>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.modalBg,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  closeBtn: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  closeTxt: { color: COLORS.white, fontSize: 20 },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    color: COLORS.lightGray,
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
    borderColor: COLORS.border,
    marginRight: 4,
  },
  tileLetter: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
