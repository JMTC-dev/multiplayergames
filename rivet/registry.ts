import { actor, setup } from "rivetkit";
import type {
  GameState,
  Player,
  ClientMessage,
  ServerMessage,
  GameAction,
} from "@/lib/games/uno/types";
import {
  initializeGame,
  playCard,
  drawCard,
  callUno,
  challengeUno,
} from "@/lib/games/uno/logic/gameEngine";
import { DEFAULT_GAME_CONFIG } from "@/lib/games/uno/types";

interface RoomState {
  gameState: GameState | null;
  players: Map<string, { id: string; name: string; connectionId: string }>;
}

export const unoGameActor = actor({
  // Durable state that persists across migrations
  state: {
    gameState: null as GameState | null,
    playersData: [] as Array<{ id: string; name: string; connectionId: string }>,
  },

  // Ephemeral variables (not persisted)
  vars: {
    connections: new Map<string, any>(),
  },

  // Actions (required by Rivet)
  actions: {},

  onWebSocket(ctx, websocket) {
    const connectionId = crypto.randomUUID();

    // Store the connection
    ctx.vars.connections.set(connectionId, websocket);

    console.log(
      `Connection ${connectionId} joined. Total: ${ctx.vars.connections.size}`
    );

    // Send current game state if it exists
    if (ctx.state.gameState) {
      const playerId = getPlayerIdByConnectionId(
        ctx.state.playersData,
        connectionId
      );
      sendToConnection(websocket, {
        type: "game_state",
        state: sanitizeStateForPlayer(ctx.state.gameState, playerId),
      });
    }

    websocket.addEventListener("message", (event) => {
      let clientMessage: ClientMessage;

      try {
        clientMessage = JSON.parse(event.data);
      } catch (e) {
        sendError(websocket, "Invalid message format");
        return;
      }

      console.log(`Message from ${connectionId}:`, clientMessage.type);

      switch (clientMessage.type) {
        case "join_game":
          handleJoinGame(ctx, connectionId, clientMessage.playerName);
          break;

        case "start_game":
          handleStartGame(ctx, websocket);
          break;

        case "game_action":
          handleGameAction(ctx, websocket, connectionId, clientMessage.action);
          break;

        case "leave_game":
          handleLeaveGame(ctx, connectionId);
          break;

        default:
          sendError(websocket, "Unknown message type");
      }
    });

    websocket.addEventListener("close", () => {
      const playerId = getPlayerIdByConnectionId(
        ctx.state.playersData,
        connectionId
      );

      if (playerId && ctx.state.gameState) {
        // Mark player as disconnected
        ctx.state.gameState = {
          ...ctx.state.gameState,
          players: ctx.state.gameState.players.map((p) =>
            p.id === playerId ? { ...p, isConnected: false } : p
          ),
        };

        broadcastGameState(ctx);

        // Notify players
        broadcast(ctx, {
          type: "player_left",
          playerId,
        });
      }

      ctx.vars.connections.delete(connectionId);
      console.log(`Connection ${connectionId} left`);
    });
  },
});

// Helper functions

function handleJoinGame(
  ctx: any,
  connectionId: string,
  playerName: string
) {
  // Check if game is full
  if (
    ctx.state.playersData.length >= DEFAULT_GAME_CONFIG.maxPlayers &&
    !ctx.state.playersData.some((p: any) => p.connectionId === connectionId)
  ) {
    const ws = ctx.vars.connections.get(connectionId);
    if (ws) sendError(ws, "Game is full");
    return;
  }

  // Check if game already started
  if (ctx.state.gameState && ctx.state.gameState.phase === "playing") {
    const ws = ctx.vars.connections.get(connectionId);
    if (ws) sendError(ws, "Game already in progress");
    return;
  }

  // Generate player ID
  const playerId = `player-${connectionId}`;

  // Add player to room
  ctx.state.playersData = [
    ...ctx.state.playersData,
    {
      id: playerId,
      name: playerName,
      connectionId,
    },
  ];

  const player: Player = {
    id: playerId,
    name: playerName,
    hand: [],
    isConnected: true,
  };

  // Broadcast player joined
  broadcast(ctx, {
    type: "player_joined",
    player,
  });

  console.log(`Player ${playerName} (${playerId}) joined`);
}

function handleStartGame(ctx: any, senderWs: any) {
  // Validate minimum players
  if (ctx.state.playersData.length < DEFAULT_GAME_CONFIG.minPlayers) {
    sendError(
      senderWs,
      `Need at least ${DEFAULT_GAME_CONFIG.minPlayers} players to start`
    );
    return;
  }

  // Check if game already started
  if (ctx.state.gameState && ctx.state.gameState.phase === "playing") {
    sendError(senderWs, "Game already in progress");
    return;
  }

  // Create player objects
  const players: Player[] = ctx.state.playersData.map((p: any) => ({
    id: p.id,
    name: p.name,
    hand: [],
    isConnected: true,
  }));

  // Initialize game
  ctx.state.gameState = initializeGame(players);

  // Broadcast game started
  broadcast(ctx, {
    type: "game_started",
    state: ctx.state.gameState,
  });

  broadcastGameState(ctx);

  console.log("Game started");
}

function handleGameAction(
  ctx: any,
  senderWs: any,
  connectionId: string,
  action: GameAction
) {
  if (!ctx.state.gameState) {
    sendError(senderWs, "Game not started");
    return;
  }

  if (ctx.state.gameState.phase !== "playing") {
    sendError(senderWs, "Game not in playing phase");
    return;
  }

  let result: { state: GameState; error?: string; penalized?: boolean };

  switch (action.type) {
    case "play_card":
      result = playCard(ctx.state.gameState, action);
      break;

    case "draw_card":
      result = drawCard(ctx.state.gameState, action.playerId);
      break;

    case "call_uno":
      result = callUno(ctx.state.gameState, action.playerId);
      break;

    case "challenge_uno":
      result = challengeUno(
        ctx.state.gameState,
        action.challengerId,
        action.targetPlayerId
      );
      break;

    case "choose_color":
      sendError(senderWs, "Invalid action type");
      return;

    default:
      sendError(senderWs, "Unknown action type");
      return;
  }

  if (result.error) {
    sendError(senderWs, result.error);
    return;
  }

  // Update game state
  ctx.state.gameState = result.state;

  // Check for winner
  if (ctx.state.gameState.winner) {
    const winner = ctx.state.gameState.players.find(
      (p: Player) => p.id === ctx.state.gameState!.winner
    );

    broadcast(ctx, {
      type: "game_over",
      winnerId: ctx.state.gameState.winner,
      winnerName: winner?.name || "Unknown",
    });
  }

  // Broadcast updated game state
  broadcastGameState(ctx);
}

function handleLeaveGame(ctx: any, connectionId: string) {
  const playerId = getPlayerIdByConnectionId(
    ctx.state.playersData,
    connectionId
  );

  if (playerId) {
    ctx.state.playersData = ctx.state.playersData.filter(
      (p: any) => p.connectionId !== connectionId
    );

    if (ctx.state.gameState) {
      // Remove player from game
      ctx.state.gameState = {
        ...ctx.state.gameState,
        players: ctx.state.gameState.players.filter((p: Player) => p.id !== playerId),
      };
    }

    broadcast(ctx, {
      type: "player_left",
      playerId,
    });
  }

  const ws = ctx.vars.connections.get(connectionId);
  if (ws) ws.close();
}

function broadcastGameState(ctx: any) {
  if (!ctx.state.gameState) return;

  // Send each player their own view of the game (hide other players' hands)
  for (const playerInfo of ctx.state.playersData) {
    const ws = ctx.vars.connections.get(playerInfo.connectionId);
    if (ws) {
      sendToConnection(ws, {
        type: "game_state",
        state: sanitizeStateForPlayer(ctx.state.gameState, playerInfo.id),
      });
    }
  }
}

function sanitizeStateForPlayer(
  state: GameState,
  playerId: string | null
): GameState {
  // Hide other players' cards
  return {
    ...state,
    players: state.players.map((player) => ({
      ...player,
      hand:
        player.id === playerId
          ? player.hand
          : player.hand.map((card) => ({
              ...card,
              // Keep card count but hide details for other players
              id: "hidden",
              type: "0" as const,
              color: null,
            })),
    })),
  };
}

function getPlayerIdByConnectionId(
  playersData: Array<{ id: string; name: string; connectionId: string }>,
  connId: string
): string | null {
  const playerInfo = playersData.find((p) => p.connectionId === connId);
  return playerInfo ? playerInfo.id : null;
}

function broadcast(ctx: any, message: ServerMessage) {
  const messageStr = JSON.stringify(message);
  for (const ws of ctx.vars.connections.values()) {
    ws.send(messageStr);
  }
}

function sendToConnection(ws: any, message: ServerMessage) {
  ws.send(JSON.stringify(message));
}

function sendError(ws: any, error: string) {
  sendToConnection(ws, {
    type: "error",
    message: error,
  });
}

// Export the registry
export const registry = setup({
  use: { unoGameActor },
});

export type Registry = typeof registry;
