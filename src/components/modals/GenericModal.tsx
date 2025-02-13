import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GenericModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  text: string;
  buttonText?: string;
}

const GenericModal: React.FC<GenericModalProps> = ({
  visible,
  onClose,
  title,
  text,
  buttonText = 'Anladım',
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{text}</Text>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default GenericModal;
