"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    const newRoomCode = generateRoomCode();
    router.push(`/uno?room=${newRoomCode}&name=${encodeURIComponent(playerName)}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    router.push(`/uno?room=${roomCode.toUpperCase()}&name=${encodeURIComponent(playerName)}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">UNO</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join a room or create a new one
          </p>
        </div>

        {/* Player Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            maxLength={20}
          />
        </div>

        {/* Create Room */}
        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Create New Room
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
              OR
            </span>
          </div>
        </div>

        {/* Join Room */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Room Code
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none uppercase"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleJoinRoom}
          disabled={!playerName.trim() || !roomCode.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Join Room
        </button>

        {/* Info */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Match cards by color or number</li>
            <li>• Use action cards strategically</li>
            <li>• Call &quot;UNO!&quot; when you have 1 card left</li>
            <li>• First player to empty their hand wins!</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
