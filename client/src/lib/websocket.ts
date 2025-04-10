import { useEffect, useRef, useState, useCallback } from 'react';

export type WebSocketMessage = {
  type: string;
  data?: any;
};

export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageListeners = useRef<Record<string, ((data: any) => void)[]>>({});

  const connectSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        socketRef.current = new WebSocket(wsUrl);
        
        socketRef.current.onopen = () => {
          console.log('WebSocket connection established');
          setIsConnected(true);
        };
        
        socketRef.current.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
          
          // Try to reconnect after a delay
          setTimeout(() => {
            connectSocket();
          }, 3000);
        };
        
        socketRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        socketRef.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            
            // Notify all listeners for this message type
            if (message.type && messageListeners.current[message.type]) {
              messageListeners.current[message.type].forEach(listener => {
                listener(message.data);
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }, []);
  
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);
  
  const addMessageListener = useCallback((type: string, callback: (data: any) => void) => {
    if (!messageListeners.current[type]) {
      messageListeners.current[type] = [];
    }
    messageListeners.current[type].push(callback);
    
    // Return function to remove listener
    return () => {
      messageListeners.current[type] = messageListeners.current[type].filter(cb => cb !== callback);
    };
  }, []);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connectSocket();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    addMessageListener
  };
}
