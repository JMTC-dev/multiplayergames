"use client";

import Card from "./Card";
import type { Card as CardType } from "@/lib/games/uno/types";

interface PlayerHandProps {
  cards: CardType[];
  onCardClick?: (card: CardType) => void;
  playableCards?: Set<string>;
}

export default function PlayerHand({
  cards,
  onCardClick,
  playableCards = new Set(),
}: PlayerHandProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-2 sm:gap-3 min-w-min px-4 justify-center sm:justify-start">
        {cards.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 py-8 text-center w-full">
            No cards in hand
          </div>
        ) : (
          cards.map((card, index) => (
            <div
              key={card.id}
              className="flex-shrink-0"
              style={{
                transform: `translateY(${index % 2 === 0 ? "0px" : "8px"})`,
              }}
            >
              <Card
                card={card}
                onClick={onCardClick ? () => onCardClick(card) : undefined}
                isPlayable={playableCards.has(card.id)}
                size="md"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
