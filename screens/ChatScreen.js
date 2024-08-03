// ChatScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ navigation, route }) {
  const { selectedVehicle } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);

  const sendMessage = () => {
    if (newMessage.trim().length === 0) return;
    setMessages([...messages, { id: messages.length, text: newMessage, sender: 'user' }]);
    setNewMessage('');
  };

  const selectEmoji = (emoji) => {
    setNewMessage(newMessage + emoji);
    setEmojiModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.receivedMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with {selectedVehicle?.name}</Text>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
          placeholderTextColor="#999"
          autoFocus={true}
        />
        <TouchableOpacity style={styles.smileyButton} onPress={() => setEmojiModalVisible(true)}>
          <Text style={styles.smileyText}>😊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={emojiModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEmojiModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select an Emoji</Text>
            <View style={styles.emojiContainer}>
              {['😊', '😂', '😍', '😭', '😒', '👍', '😢', '😎', '😡'].map((emoji) => (
                <TouchableOpacity key={emoji} onPress={() => selectEmoji(emoji)} style={styles.emojiButton}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setEmojiModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#6200ea',
    color: 'white',
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#6200ea',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
  },
  smileyButton: {
    marginRight: 10,
    padding: 10,
  },
  smileyText: {
    fontSize: 24,
  },
  sendButton: {
    backgroundColor: '#6200ea',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    padding: 10,
  },
  emojiText: {
    fontSize: 30,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#6200ea',
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
