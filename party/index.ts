import type * as Party from "partykit/server";
import type {
  GameState,
  Player,
  ClientMessage,
  ServerMessage,
  GameAction,
} from "../lib/games/uno/types";
import {
  initializeGame,
  playCard,
  drawCard,
  callUno,
  challengeUno,
} from "../lib/games/uno/logic/gameEngine";
import { DEFAULT_GAME_CONFIG } from "../lib/games/uno/types";

interface RoomState {
  gameState: GameState | null;
  players: Map<string, { id: string; name: string; connectionId: string }>;
}

export default class UNOGameServer implements Party.Server {
  private state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = {
      gameState: null,
      players: new Map(),
    };
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connection ${conn.id} joined room ${this.room.id}. Total: ${
        [...this.room.getConnections()].length
      }`
    );

    // Send current game state to new connection
    if (this.state.gameState) {
      this.sendToConnection(conn, {
        type: "game_state",
        state: this.sanitizeStateForPlayer(
          this.state.gameState,
          this.getPlayerIdByConnectionId(conn.id)
        ),
      });
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    let clientMessage: ClientMessage;

    try {
      clientMessage = JSON.parse(message);
    } catch (e) {
      this.sendError(sender, "Invalid message format");
      return;
    }

    console.log(`Message from ${sender.id}:`, clientMessage.type);

    switch (clientMessage.type) {
      case "join_game":
        this.handleJoinGame(sender, clientMessage.playerName);
        break;

      case "start_game":
        this.handleStartGame(sender);
        break;

      case "game_action":
        this.handleGameAction(sender, clientMessage.action);
        break;

      case "leave_game":
        this.handleLeaveGame(sender);
        break;

      default:
        this.sendError(sender, "Unknown message type");
    }
  }

  async onClose(conn: Party.Connection) {
    const playerId = this.getPlayerIdByConnectionId(conn.id);

    if (playerId && this.state.gameState) {
      // Mark player as disconnected
      this.state.gameState = {
        ...this.state.gameState,
        players: this.state.gameState.players.map((p) =>
          p.id === playerId ? { ...p, isConnected: false } : p
        ),
      };

      this.broadcastGameState();

      // Notify players
      this.broadcast({
        type: "player_left",
        playerId,
      });
    }

    console.log(`Connection ${conn.id} left room ${this.room.id}`);
  }

  // Helper Methods

  private handleJoinGame(conn: Party.Connection, playerName: string) {
    // Check if game is full
    if (
      this.state.players.size >= DEFAULT_GAME_CONFIG.maxPlayers &&
      !this.state.players.has(conn.id)
    ) {
      this.sendError(conn, "Game is full");
      return;
    }

    // Check if game already started
    if (this.state.gameState && this.state.gameState.phase === "playing") {
      this.sendError(conn, "Game already in progress");
      return;
    }

    // Generate player ID
    const playerId = `player-${conn.id}`;

    // Add player to room
    this.state.players.set(conn.id, {
      id: playerId,
      name: playerName,
      connectionId: conn.id,
    });

    const player: Player = {
      id: playerId,
      name: playerName,
      hand: [],
      isConnected: true,
    };

    // Broadcast player joined
    this.broadcast({
      type: "player_joined",
      player,
    });

    console.log(`Player ${playerName} (${playerId}) joined room ${this.room.id}`);
  }

  private handleStartGame(sender: Party.Connection) {
    // Validate minimum players
    if (this.state.players.size < DEFAULT_GAME_CONFIG.minPlayers) {
      this.sendError(
        sender,
        `Need at least ${DEFAULT_GAME_CONFIG.minPlayers} players to start`
      );
      return;
    }

    // Check if game already started
    if (this.state.gameState && this.state.gameState.phase === "playing") {
      this.sendError(sender, "Game already in progress");
      return;
    }

    // Create player objects
    const players: Player[] = Array.from(this.state.players.values()).map(
      (p) => ({
        id: p.id,
        name: p.name,
        hand: [],
        isConnected: true,
      })
    );

    // Initialize game
    this.state.gameState = initializeGame(players);

    // Broadcast game started
    this.broadcast({
      type: "game_started",
      state: this.state.gameState,
    });

    this.broadcastGameState();

    console.log(`Game started in room ${this.room.id}`);
  }

  private handleGameAction(sender: Party.Connection, action: GameAction) {
    if (!this.state.gameState) {
      this.sendError(sender, "Game not started");
      return;
    }

    if (this.state.gameState.phase !== "playing") {
      this.sendError(sender, "Game not in playing phase");
      return;
    }

    let result: { state: GameState; error?: string; penalized?: boolean };

    switch (action.type) {
      case "play_card":
        result = playCard(this.state.gameState, action);
        break;

      case "draw_card":
        result = drawCard(this.state.gameState, action.playerId);
        break;

      case "call_uno":
        result = callUno(this.state.gameState, action.playerId);
        break;

      case "challenge_uno":
        result = challengeUno(
          this.state.gameState,
          action.challengerId,
          action.targetPlayerId
        );
        break;

      case "choose_color":
        // Color choice is handled in play_card action
        this.sendError(sender, "Invalid action type");
        return;

      default:
        this.sendError(sender, "Unknown action type");
        return;
    }

    if (result.error) {
      this.sendError(sender, result.error);
      return;
    }

    // Update game state
    this.state.gameState = result.state;

    // Check for winner
    if (this.state.gameState.winner) {
      const winner = this.state.gameState.players.find(
        (p) => p.id === this.state.gameState!.winner
      );

      this.broadcast({
        type: "game_over",
        winnerId: this.state.gameState.winner,
        winnerName: winner?.name || "Unknown",
      });
    }

    // Broadcast updated game state
    this.broadcastGameState();
  }

  private handleLeaveGame(sender: Party.Connection) {
    const playerId = this.getPlayerIdByConnectionId(sender.id);

    if (playerId) {
      this.state.players.delete(sender.id);

      if (this.state.gameState) {
        // Remove player from game
        this.state.gameState = {
          ...this.state.gameState,
          players: this.state.gameState.players.filter(
            (p) => p.id !== playerId
          ),
        };
      }

      this.broadcast({
        type: "player_left",
        playerId,
      });
    }

    sender.close();
  }

  private broadcastGameState() {
    if (!this.state.gameState) return;

    // Send each player their own view of the game (hide other players' hands)
    for (const [connId, playerInfo] of this.state.players) {
      const conn = [...this.room.getConnections()].find((c) => c.id === connId);
      if (conn) {
        this.sendToConnection(conn, {
          type: "game_state",
          state: this.sanitizeStateForPlayer(
            this.state.gameState,
            playerInfo.id
          ),
        });
      }
    }
  }

  private sanitizeStateForPlayer(
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

  private getPlayerIdByConnectionId(connId: string): string | null {
    const playerInfo = this.state.players.get(connId);
    return playerInfo ? playerInfo.id : null;
  }

  private broadcast(message: ServerMessage) {
    this.room.broadcast(JSON.stringify(message));
  }

  private sendToConnection(conn: Party.Connection, message: ServerMessage) {
    conn.send(JSON.stringify(message));
  }

  private sendError(conn: Party.Connection, error: string) {
    this.sendToConnection(conn, {
      type: "error",
      message: error,
    });
  }
}

UNOGameServer satisfies Party.Worker;
