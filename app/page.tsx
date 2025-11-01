import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl sm:text-6xl font-bold text-center mb-4">
          Multiplayer Games
        </h1>
        <p className="text-lg sm:text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
          Play your favorite games with friends online
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Game cards will go here */}
          <div className="bg-gradient-to-br from-red-500 to-yellow-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">UNO</h2>
            <p className="mb-4 opacity-90">Classic card game - Play now!</p>
            <Link href="/lobby" className="block w-full bg-white text-red-600 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition text-center">
              Play Now
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-lg shadow-lg text-white opacity-60">
            <h2 className="text-2xl font-bold mb-2">Connect 4</h2>
            <p className="mb-4 opacity-90">Drop and connect - Coming soon!</p>
            <button className="w-full bg-white/50 text-white font-semibold py-2 px-4 rounded cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-teal-500 p-6 rounded-lg shadow-lg text-white opacity-60">
            <h2 className="text-2xl font-bold mb-2">Battleships</h2>
            <p className="mb-4 opacity-90">Sink the fleet - Coming soon!</p>
            <button className="w-full bg-white/50 text-white font-semibold py-2 px-4 rounded cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-6 rounded-lg shadow-lg text-white opacity-60">
            <h2 className="text-2xl font-bold mb-2">Chess</h2>
            <p className="mb-4 opacity-90">Classic strategy - Coming soon!</p>
            <button className="w-full bg-white/50 text-white font-semibold py-2 px-4 rounded cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg shadow-lg text-white opacity-60">
            <h2 className="text-2xl font-bold mb-2">Checkers</h2>
            <p className="mb-4 opacity-90">Jump and capture - Coming soon!</p>
            <button className="w-full bg-white/50 text-white font-semibold py-2 px-4 rounded cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
