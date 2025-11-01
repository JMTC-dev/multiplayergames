"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ServerMessage, ClientMessage } from "../games/uno/types";

export function useRivetSocket(roomId: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageHandlersRef = useRef<Set<(message: ServerMessage) => void>>(
    new Set()
  );

  // Initialize socket connection
  useEffect(() => {
    if (!roomId) return;

    // Build the WebSocket URL for Rivet actor
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/rivet/unoGameActor/${roomId}`;

    console.log("Connecting to Rivet:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      console.log("Connected to Rivet");
      setIsConnected(true);
      setError(null);
    });

    ws.addEventListener("message", (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        messageHandlersRef.current.forEach((handler) => handler(message));
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    ws.addEventListener("error", (event) => {
      console.error("Rivet WebSocket error:", event);
      setError("Connection error");
    });

    ws.addEventListener("close", () => {
      console.log("Disconnected from Rivet");
      setIsConnected(false);
    });

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId]);

  // Send message to server
  const sendMessage = useCallback(
    (message: ClientMessage) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket, isConnected]
  );

  // Subscribe to messages
  const onMessage = useCallback((handler: (message: ServerMessage) => void) => {
    messageHandlersRef.current.add(handler);
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    onMessage,
  };
}
