import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    // Get the current host and protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(wsUrl);

    socket.addEventListener("open", () => {
      setIsConnected(true);
      setError(null);
      clearTimeout(reconnectTimeoutRef.current);
      options.onOpen?.();
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        options.onMessage?.(data);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
      options.onClose?.();

      // Attempt reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    });

    socket.addEventListener("error", (event) => {
      setError(event);
      options.onError?.(event);
    });

    socketRef.current = socket;
  }, [options]);

  // Connect on component mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  // Send message function
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
  };
}
