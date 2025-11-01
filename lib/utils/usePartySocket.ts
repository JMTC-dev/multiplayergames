"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PartySocket from "partysocket";
import type { ServerMessage, ClientMessage } from "../games/uno/types";

export function usePartySocket(roomId: string | null) {
  const [socket, setSocket] = useState<PartySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageHandlersRef = useRef<Set<(message: ServerMessage) => void>>(
    new Set()
  );

  // Initialize socket connection
  useEffect(() => {
    if (!roomId) return;

    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!host) {
      setError("PartyKit host not configured");
      return;
    }

    const partySocket = new PartySocket({
      host,
      room: roomId,
    });

    partySocket.addEventListener("open", () => {
      console.log("Connected to PartyKit");
      setIsConnected(true);
      setError(null);
    });

    partySocket.addEventListener("message", (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        messageHandlersRef.current.forEach((handler) => handler(message));
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    });

    partySocket.addEventListener("error", (event) => {
      console.error("PartySocket error:", event);
      setError("Connection error");
    });

    partySocket.addEventListener("close", () => {
      console.log("Disconnected from PartyKit");
      setIsConnected(false);
    });

    setSocket(partySocket);

    return () => {
      partySocket.close();
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
