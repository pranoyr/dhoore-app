import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const listeners = []; // Store listeners for incoming messages
// websocket.js
let ws;


// const ip_addr = "172.20.10.3"
const ip_addr = "16.16.68.77"

const wsUrl = 'ws://'+ip_addr+':3000';



export const initWebSocket = (userId) => {
    if (ws) {
      console.log('WebSocket already initialized');
      return;
    }
  
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
        console.log('Received WebSocket message:', message);
  
        // Call all registered listeners
        listeners.forEach((callback) => callback(message));
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


export const sendPlaceInfo = (place) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
            JSON.stringify({
                type: 'search_broadcast',
                data: {
                    place,
                },
            })
        );
        console.log('Place info sent:', place);
    } else {
        console.error('WebSocket is not connected');
    }
};




// listeners

export const addWebSocketListener = (callback) => {
    if (!listeners.includes(callback)) {
      listeners.push(callback);
    }
  };
  
  export const removeWebSocketListener = (callback) => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };


//closing
export const closeWebSocket = () => {
    if (ws) {
      ws.close();
      ws = null;
      isConnected = false;
      console.log('WebSocket closed');
    }
  };