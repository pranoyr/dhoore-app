// ChatScreen.js
import React, { useState, useEffect } from 'react';

import { View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal,
  Alert,
  Button ,
  TouchableWithoutFeedback} from 'react-native';
import apiRequest from '../apis/api';

export default function ChatScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);


  const fetchChats = async () => {
    try {
      const fetchedChats = await apiRequest('/api/last-messages', 'GET'); // Fetch chat list
      console.log('Fetching last chat:', fetchedChats);
      setChats(fetchedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };


  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchChats);
    return unsubscribe;
  }, [navigation])


  const handleDeleteChat = async (chatId) => {
    try {
      await apiRequest(`/api/delete-chat/${chatId}`, 'GET'); // Replace with your API endpoint
      console.log(`Chat with ID ${chatId} deleted.`);
      fetchChats(); // Refresh the chat list
      // close model
      closeModal();
    } catch (error) {
      console.error(`Error deleting chat with ID ${chatId}:`, error);
    }
  };


  const openModal = (chat) => {
    setSelectedChat(chat);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedChat(null);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
         const fetchedChats = await apiRequest('/api/last-messages', 'GET'); // Fetch chat list
        // const fetchedChats = [
        //   { id: '1', name: 'John Doe', lastMessage: 'Hello there!' },
        //   { id: '2', name: 'Jane Smith', lastMessage: 'How are you?' },
        //   { id: '3', name: 'Alice Johnson', lastMessage: 'Good morning!' },
        //   { id: '4', name: 'Bob Brown', lastMessage: 'See you later!' },
        // ];
    
        setChats(fetchedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchChats);

    return unsubscribe;
  }, [navigation]);

  const renderChatItem = ({ item }) => (

    <TouchableOpacity
      style={styles.chatItem}
   
      onPress={() => navigation.navigate('PersonChatScreen', { selectedChat: item })}
      onLongPress={() => openModal(item)}
    >
      <Text style={styles.chatName}>{item.name}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chats</Text>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => `${item.id}`}
        contentContainerStyle={styles.chatListContainer}
      />

      {/* Custom Context Menu Modal */}
      {selectedChat && (
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalMenu}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Mark as unread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Archive</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Mute</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Block {selectedChat.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, styles.deleteItem]}
                  onPress={() => handleDeleteChat(selectedChat.id)}
                >
                  <Text style={[styles.menuText, styles.deleteText]}>Delete chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
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
  chatListContainer: {
    paddingHorizontal: 10,
  },
  chatItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#666',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMenu: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  menuItem: {
    padding: 15,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuText: {
    fontSize: 16,
  },
  deleteItem: {
    backgroundColor: '#fee',
  },
  deleteText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
});
