"use client";

import type { Card as CardType, CardColor } from "@/lib/games/uno/types";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  size?: "sm" | "md" | "lg";
}

const colorStyles: Record<CardColor, string> = {
  red: "bg-gradient-to-br from-red-500 to-red-700",
  blue: "bg-gradient-to-br from-blue-500 to-blue-700",
  green: "bg-gradient-to-br from-green-500 to-green-700",
  yellow: "bg-gradient-to-br from-yellow-400 to-yellow-600",
};

const sizeStyles = {
  sm: {
    card: "w-16 h-24",
    text: "text-xl",
    icon: "text-xs",
  },
  md: {
    card: "w-20 h-28",
    text: "text-2xl",
    icon: "text-sm",
  },
  lg: {
    card: "w-24 h-36",
    text: "text-3xl",
    icon: "text-base",
  },
};

export default function Card({
  card,
  onClick,
  disabled = false,
  isPlayable = false,
  size = "md",
}: CardProps) {
  const getCardDisplay = () => {
    switch (card.type) {
      case "skip":
        return { text: "⊘", label: "Skip" };
      case "reverse":
        return { text: "⇄", label: "Reverse" };
      case "draw2":
        return { text: "+2", label: "Draw 2" };
      case "wild":
        return { text: "W", label: "Wild" };
      case "wild_draw4":
        return { text: "+4", label: "Wild +4" };
      default:
        return { text: card.type, label: card.type };
    }
  };

  const display = getCardDisplay();
  const isWild = card.type === "wild" || card.type === "wild_draw4";

  const cardClasses = `
    ${sizeStyles[size].card}
    relative rounded-lg shadow-lg flex items-center justify-center
    transition-all duration-200
    ${
      onClick && !disabled
        ? "cursor-pointer hover:scale-110 hover:-translate-y-2 active:scale-105"
        : ""
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${isPlayable ? "ring-2 ring-yellow-400 ring-offset-2 animate-pulse" : ""}
    ${isWild ? "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500" : ""}
    ${!isWild && card.color ? colorStyles[card.color] : ""}
    ${!isWild && !card.color ? "bg-gray-800" : ""}
  `;

  return (
    <div
      className={cardClasses}
      onClick={!disabled && onClick ? onClick : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {/* Card background circle */}
      <div className="absolute inset-2 bg-white/90 rounded-full flex items-center justify-center">
        <div className="text-center">
          <div
            className={`font-bold ${sizeStyles[size].text} ${
              isWild ? "text-gray-800" : card.color ? `text-${card.color}-700` : "text-gray-700"
            }`}
          >
            {display.text}
          </div>
        </div>
      </div>

      {/* Corner indicators */}
      <div className="absolute top-1 left-1">
        <div
          className={`${sizeStyles[size].icon} font-bold text-white`}
        >
          {display.text}
        </div>
      </div>
      <div className="absolute bottom-1 right-1 rotate-180">
        <div
          className={`${sizeStyles[size].icon} font-bold text-white`}
        >
          {display.text}
        </div>
      </div>
    </div>
  );
}
