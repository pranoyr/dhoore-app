import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';




// websocket.js
let ws;


const ip_addr = "localhost"
// const ip_addr = "16.16.68.77"

const wsUrl = 'ws://'+ip_addr+':3000';



  export const initWebSocket = (userId, onMessage) => {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('WebSocket connected');

        ws.send(
            JSON.stringify({
                type: 'authenticate',
                user_id: userId,
            })
        );
        console.log('Authenticate message sent with user_id:', userId);
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            // console.log('Received WebSocket message:', message);
            onMessage(message);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
    };

    return ws;
};



export const sendMessageWebSocket = (recipientId, content, senderId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                type: 'message',
                data: {
                    recipient_id: recipientId,
                    content,
                    sender_id: senderId,
                },
            })
        );
    } else {
        console.error('WebSocket is not connected');
    }
};
