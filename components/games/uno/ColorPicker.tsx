"use client";

import type { CardColor } from "@/lib/games/uno/types";

interface ColorPickerProps {
  onColorSelect: (color: CardColor) => void;
}

const colors: Array<{ color: CardColor; label: string; bg: string }> = [
  { color: "red", label: "Red", bg: "bg-red-500 hover:bg-red-600" },
  { color: "blue", label: "Blue", bg: "bg-blue-500 hover:bg-blue-600" },
  { color: "green", label: "Green", bg: "bg-green-500 hover:bg-green-600" },
  { color: "yellow", label: "Yellow", bg: "bg-yellow-400 hover:bg-yellow-500" },
];

export default function ColorPicker({ onColorSelect }: ColorPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-center">Choose a Color</h3>
        <div className="grid grid-cols-2 gap-4">
          {colors.map(({ color, label, bg }) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`${bg} text-white font-bold py-6 px-4 rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
