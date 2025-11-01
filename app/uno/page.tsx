"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGameRoom } from "@/lib/hooks/useGameRoom";
import type {
  Card as CardType,
  CardColor,
  Player,
} from "@/lib/games/uno/types";
import { canPlayCard } from "@/lib/games/uno/logic/validation";
import GameBoard from "@/components/games/uno/GameBoard";
import PlayerHand from "@/components/games/uno/PlayerHand";
import ColorPicker from "@/components/games/uno/ColorPicker";
import GameControls from "@/components/games/uno/GameControls";

function UNOGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("room");
  const playerName = searchParams.get("name");

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<CardType | null>(null);
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);

  // Use the Socket.IO game room hook
  const {
    gameState,
    waitingPlayers,
    isConnected,
    error,
    startGame,
    playCard: playCardAction,
    drawCard: drawCardAction,
    callUno: callUnoAction,
  } = useGameRoom({
    roomId: roomCode || "",
    playerName: playerName || "",
  });

  // Find my player ID
  const myPlayerId = gameState?.players.find((p) => p.name === playerName)?.id || null;
  const gameStarted = gameState?.phase === "playing" || gameState?.phase === "finished";

  const handleStartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const handlePlayCard = useCallback(
    (card: CardType) => {
      if (!myPlayerId || !gameState) return;

      // If it's a wild card, show color picker
      if (card.type === "wild" || card.type === "wild_draw4") {
        setPendingWildCard(card);
        setShowColorPicker(true);
        return;
      }

      // Play regular card
      playCardAction(myPlayerId, card);
    },
    [myPlayerId, gameState, playCardAction]
  );

  const handleColorSelect = useCallback(
    (color: CardColor) => {
      if (!myPlayerId || !pendingWildCard) return;

      playCardAction(myPlayerId, pendingWildCard, color);

      setShowColorPicker(false);
      setPendingWildCard(null);
    },
    [myPlayerId, pendingWildCard, playCardAction]
  );

  const handleDrawCard = useCallback(() => {
    if (!myPlayerId) return;
    drawCardAction(myPlayerId);
  }, [myPlayerId, drawCardAction]);

  const handleCallUno = useCallback(() => {
    if (!myPlayerId) return;
    callUnoAction(myPlayerId);
  }, [myPlayerId, callUnoAction]);

  // Check validation
  const myPlayer = gameState?.players.find((p) => p.id === myPlayerId);
  const isMyTurn =
    gameState && myPlayerId
      ? gameState.players[gameState.currentPlayerIndex]?.id === myPlayerId
      : false;
  const topCard =
    gameState && gameState.discardPile.length > 0
      ? gameState.discardPile[gameState.discardPile.length - 1]
      : null;

  // Determine playable cards
  const playableCards = new Set<string>();
  if (isMyTurn && topCard && myPlayer && gameState) {
    myPlayer.hand.forEach((card) => {
      if (canPlayCard(card, topCard, gameState.currentColor)) {
        playableCards.add(card.id);
      }
    });
  }

  const canDraw = isMyTurn;
  const canCallUno = myPlayer && myPlayer.hand.length === 2;
  const hasCalledUno = gameState?.calledUno.includes(myPlayerId || "") || false;

  if (!roomCode || !playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Room</h2>
          <Link
            href="/lobby"
            className="text-blue-500 hover:underline"
          >
            Go to Lobby
          </Link>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Connecting...</div>
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (!gameStarted || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Room: {roomCode}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Waiting for players...
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {waitingPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-semibold">{player.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartGame}
            disabled={waitingPlayers.length < 2}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all"
          >
            {waitingPlayers.length < 2 ? "Waiting for players..." : "Start Game"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Share room code: <span className="font-mono font-bold text-lg">{roomCode}</span>
          </div>
        </div>
      </div>
    );
  }

  // Game over
  if (winner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
          <p className="text-2xl mb-8">
            <span className="font-bold text-green-600">{winner.name}</span> wins!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/lobby")}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
            >
              Play Again
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/30 p-4 flex justify-between items-center">
        <div className="text-white font-bold">Room: {roomCode}</div>
        <Link href="/lobby" className="text-white hover:underline text-sm">
          Leave Game
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 text-center">
          {error}
        </div>
      )}

      {/* Game Board */}
      {topCard && (
        <GameBoard
          topCard={topCard}
          currentColor={gameState.currentColor}
          drawPileCount={gameState.drawPile.length}
          players={gameState.players}
          currentPlayerIndex={gameState.currentPlayerIndex}
          myPlayerId={myPlayerId || ""}
          onDrawCard={handleDrawCard}
          canDraw={canDraw}
        />
      )}

      {/* Game Controls */}
      <GameControls
        canCallUno={Boolean(canCallUno)}
        hasCalledUno={hasCalledUno}
        onCallUno={handleCallUno}
      />

      {/* Player Hand */}
      {myPlayer && (
        <div className="bg-black/30 p-4">
          <PlayerHand
            cards={myPlayer.hand}
            onCardClick={isMyTurn ? handlePlayCard : undefined}
            playableCards={playableCards}
          />
        </div>
      )}

      {/* Color Picker Modal */}
      {showColorPicker && <ColorPicker onColorSelect={handleColorSelect} />}
    </div>
  );
}

export default function UNOGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <UNOGameContent />
    </Suspense>
  );
}
