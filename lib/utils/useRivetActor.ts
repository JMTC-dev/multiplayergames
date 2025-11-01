"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useActor } from "./useRivetClient";
import type { ServerMessage, ClientMessage } from "../games/uno/types";

export function useRivetActor(roomId: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageHandlersRef = useRef<Set<(message: ServerMessage) => void>>(
    new Set()
  );

  // Get actor instance - use a placeholder key if roomId is null
  const unoGameActor = useActor({
    name: "unoGameActor",
    key: [roomId || "placeholder"],
  });

  // Initialize socket connection
  useEffect(() => {
    if (!roomId) return;

    let ws: WebSocket | null = null;

    const connectWebSocket = async () => {
      try {
        console.log("Connecting to Rivet actor:", roomId);

        // Get WebSocket from actor - using type assertion since types are incomplete
        ws = await (unoGameActor as any).websocket();

        if (!ws) {
          throw new Error("Failed to create WebSocket connection");
        }

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
      } catch (err) {
        console.error("Failed to connect to Rivet:", err);
        setError("Failed to connect");
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [roomId, unoGameActor]);

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
