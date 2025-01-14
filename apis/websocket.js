import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const listeners = []; // Store listeners for incoming messages
// websocket.js
let ws;

let reconnectInterval = 1000; // Initial reconnect interval (1 second)
const maxReconnectInterval = 30000; // Maximum interval (30 seconds)
let isManuallyClosed = false;


const ip_addr = "192.168.2.240"
// const ip_addr = "16.16.68.77"

const wsUrl = 'ws://'+ip_addr+':3000';


let pingInterval;
const pingIntervalTime = 30000; // 30 seconds

const startHeartbeat = () => {
  if (pingInterval) return;

  pingInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
      console.log('Ping sent');
    } else {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  }, pingIntervalTime);
};




export const initWebSocket = (userId) => {
  if (ws) {
    console.log('WebSocket already initialized');
    return;
  }

  connectWebSocket(userId);
};

const connectWebSocket = (userId) => {
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectInterval = 1000; // Reset reconnect interval on successful connection
    ws.send(
      JSON.stringify({
        type: 'authenticate',
        user_id: userId,
      })
    );
    console.log('Authenticate message sent with user_id:', userId);

    startHeartbeat(); // Start sending pings
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


export const sendPlaceInfo = (vehicleInfo, place, stopSearch) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
          JSON.stringify({
              type: 'search_broadcast',
              data: {
                  vehicleInfo,
                  place,
                  stopSearch,
              },
          })
      );
      console.log('Place info sent:', { vehicleInfo, place, stopSearch });
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


const reconnectWebSocket = (userId) => {
  setTimeout(() => {
    console.log(`Attempting to reconnect... (interval: ${reconnectInterval / 1000}s)`);
    connectWebSocket(userId);
    reconnectInterval = Math.min(reconnectInterval * 2, maxReconnectInterval); // Exponential backoff
  }, reconnectInterval);
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