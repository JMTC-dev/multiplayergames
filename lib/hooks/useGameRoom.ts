'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState } from '@/lib/games/uno/types';

interface UseGameRoomOptions {
  roomId: string;
  playerName: string;
  serverUrl?: string;
}

interface WaitingPlayer {
  id: string;
  name: string;
  connectionId: string;
}

interface GameRoomState {
  gameState: GameState | null;
  waitingPlayers: WaitingPlayer[];
  isConnected: boolean;
  error: string | null;
}

export function useGameRoom({ roomId, playerName, serverUrl }: UseGameRoomOptions) {
  const [state, setState] = useState<GameRoomState>({
    gameState: null,
    waitingPlayers: [],
    isConnected: false,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const url = serverUrl || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(url, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setState((prev) => ({ ...prev, isConnected: true, error: null }));

      // Join the game room
      socket.emit('join_game', { roomId, playerName });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setState((prev) => ({ ...prev, error: error.message }));
    });

    // Game state handlers
    socket.on('game_state', ({ state: gameState }: { state: GameState }) => {
      setState((prev) => ({ ...prev, gameState }));
    });

    socket.on('game_started', ({ state: gameState }: { state: GameState }) => {
      setState((prev) => ({ ...prev, gameState }));
    });

    socket.on('game_over', ({ winnerId, winnerName }: { winnerId: string; winnerName: string }) => {
      console.log(`Game over! Winner: ${winnerName}`);
      // Keep the current game state but log the winner
    });

    // Waiting room handlers
    socket.on('players_list', ({ players }: { players: WaitingPlayer[] }) => {
      console.log('Received players list:', players);
      setState((prev) => ({ ...prev, waitingPlayers: players }));
    });

    socket.on('player_joined', ({ player, players }: { player: WaitingPlayer; players: WaitingPlayer[] }) => {
      console.log(`Player joined: ${player.name}`);
      if (players) {
        setState((prev) => ({ ...prev, waitingPlayers: players }));
      }
    });

    socket.on('error', ({ message }: { message: string }) => {
      console.error('Game error:', message);
      setState((prev) => ({ ...prev, error: message }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [roomId, playerName, serverUrl]);

  // Helper functions to send game actions
  const startGame = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('start_game', { roomId });
    }
  };

  const playCard = (playerId: string, card: any, chosenColor?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game_action', {
        roomId,
        action: {
          type: 'play_card',
          playerId,
          card,
          chosenColor,
        },
      });
    }
  };

  const drawCard = (playerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game_action', {
        roomId,
        action: {
          type: 'draw_card',
          playerId,
        },
      });
    }
  };

  const callUno = (playerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game_action', {
        roomId,
        action: {
          type: 'call_uno',
          playerId,
        },
      });
    }
  };

  const challengeUno = (challengerId: string, targetPlayerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('game_action', {
        roomId,
        action: {
          type: 'challenge_uno',
          challengerId,
          targetPlayerId,
        },
      });
    }
  };

  return {
    ...state,
    startGame,
    playCard,
    drawCard,
    callUno,
    challengeUno,
  };
}
