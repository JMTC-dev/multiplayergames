"use client";

import Card from "./Card";
import type { Card as CardType, Player, CardColor } from "@/lib/games/uno/types";

interface GameBoardProps {
  topCard: CardType;
  currentColor: CardColor;
  drawPileCount: number;
  players: Player[];
  currentPlayerIndex: number;
  myPlayerId: string;
  onDrawCard?: () => void;
  canDraw?: boolean;
}

export default function GameBoard({
  topCard,
  currentColor,
  drawPileCount,
  players,
  currentPlayerIndex,
  myPlayerId,
  onDrawCard,
  canDraw = false,
}: GameBoardProps) {
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;

  // Get other players (not me)
  const otherPlayers = players.filter((p) => p.id !== myPlayerId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
      {/* Other Players */}
      <div className="flex flex-wrap gap-4 justify-center">
        {otherPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md ${
              currentPlayer?.id === player.id
                ? "ring-2 ring-yellow-400 ring-offset-2"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  player.isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="font-semibold">{player.name}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {player.hand.length} {player.hand.length === 1 ? "card" : "cards"}
              {player.hand.length === 1 && " 🔴"}
            </div>
          </div>
        ))}
      </div>

      {/* Game Table */}
      <div className="flex items-center gap-8 sm:gap-12">
        {/* Draw Pile */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDrawCard}
            disabled={!canDraw}
            className={`relative ${
              canDraw
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            {/* Stack of cards */}
            <div className="relative w-24 h-36">
              <div className="absolute inset-0 bg-gray-700 rounded-lg shadow-lg" />
              <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-gray-600 rounded-lg shadow-lg" />
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-4xl font-bold text-white">UNO</div>
              </div>
            </div>
          </button>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {drawPileCount} cards
          </div>
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Card card={topCard} size="lg" />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full border-2 border-gray-300 ${
                currentColor === "red"
                  ? "bg-red-500"
                  : currentColor === "blue"
                  ? "bg-blue-500"
                  : currentColor === "green"
                  ? "bg-green-500"
                  : "bg-yellow-400"
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {currentColor}
            </span>
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="text-center">
        {isMyTurn ? (
          <div className="text-lg font-bold text-green-600 dark:text-green-400 animate-pulse">
            Your Turn!
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Waiting for {currentPlayer?.name}...
          </div>
        )}
      </div>
    </div>
  );
}
