import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiRequest from '../apis/api';
import { initWebSocket, sendMessageWebSocket } from '../apis/websocket';
import { useAppContext } from './AppProvider'; // Adjust the path to your context file

export default function PersonChatScreen({ navigation, route }) {
    const { selectedChat } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { userId } = useAppContext(); // Access values from the context
    const scrollViewRef = useRef(null);

    useEffect(() => {
        console.log('Initializing WebSocket');
        const wsInstance = initWebSocket(userId, (message) => {
            if (
                message.type === 'message' &&
                (message.data.sender_id === selectedChat.id || message.data.recipient_id === selectedChat.id)
            ) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        text: message.data.content,
                        sender: message.data.sender_id === userId ? 'user' : 'recipient',
                    },
                ]);
            }
        });

        return () => {
            if (wsInstance) {
                console.log('Closing WebSocket on component unmount');
                wsInstance.close();
            }
        };
    }, [selectedChat, userId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await apiRequest(`/api/messages/${selectedChat.id}`, 'GET');
                setMessages(fetchedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [selectedChat]);

    const sendMessage = async () => {
        if (newMessage.trim().length === 0) return;

        const updatedMessages = [
            ...messages,
            { id: Date.now(), text: newMessage, sender: 'user' },
        ];
        setMessages(updatedMessages);
        setNewMessage('');

        try {
            sendMessageWebSocket(selectedChat.id, newMessage, userId);
            await apiRequest('/api/send-message-by-id', 'POST', {
                recipient_id: selectedChat.id,
                content: newMessage,
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessageItem = ({ text, sender, id }) => (
        <View
            key={id}
            style={[
                styles.messageContainer,
                sender === 'user' ? styles.userMessage : styles.receivedMessage,
            ]}
        >
            <Text style={styles.messageText}>{text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={80}
        >
            <View style={styles.chatHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.chatHeaderText}>{selectedChat.name}</Text>
            </View>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            >
                {messages.map((message) => renderMessageItem(message))}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#6200ea',
    },
    chatHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 15,
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
    sendButton: {
        backgroundColor: '#6200ea',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
