"use client";

interface GameControlsProps {
  canCallUno: boolean;
  hasCalledUno: boolean;
  onCallUno: () => void;
}

export default function GameControls({
  canCallUno,
  hasCalledUno,
  onCallUno,
}: GameControlsProps) {
  return (
    <div className="flex justify-center items-center gap-4 p-4">
      <button
        onClick={onCallUno}
        disabled={!canCallUno || hasCalledUno}
        className={`
          px-8 py-4 rounded-lg font-bold text-white text-xl shadow-lg
          transition-all duration-200
          ${
            canCallUno && !hasCalledUno
              ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:scale-110 animate-pulse cursor-pointer"
              : "bg-gray-400 cursor-not-allowed opacity-50"
          }
        `}
      >
        {hasCalledUno ? "UNO! ✓" : "Call UNO!"}
      </button>
    </div>
  );
}
