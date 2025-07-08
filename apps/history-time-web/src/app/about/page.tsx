'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">About History Time</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2>What is History Time?</h2>
            <p>
              History Time is an interactive educational game designed to help players learn about
              historical events by placing them in chronological order. The game is both fun and
              educational, challenging your knowledge of history and improving your understanding of
              the sequence of major historical events.
            </p>

            <div className="my-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-blue-700 dark:text-blue-300">How to Play</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Choose your game difficulty and number of cards</li>
                <li>You&apos;ll receive a set of historical event cards with the years hidden</li>
                <li>
                  Drag and drop each card onto the timeline in the order you believe the events
                  occurred
                </li>
                <li>
                  Once all cards are placed, your score will be calculated based on accuracy and
                  time
                </li>
                <li>The more accurate your timeline, the higher your score!</li>
              </ol>
            </div>

            <h2>Scoring System</h2>
            <p>Your score is calculated based on several factors:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Correct placements:</strong> The number of cards you placed in the correct
                chronological position
              </li>
              <li>
                <strong>Time taken:</strong> The faster you complete the game, the higher your score
              </li>
              <li>
                <strong>Difficulty level:</strong> Higher difficulty levels award more points
              </li>
              <li>
                <strong>Total cards:</strong> Games with more cards offer greater scoring potential
              </li>
            </ul>

            <h2>Card Categories</h2>
            <p>History Time features cards from various categories, including:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Political</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Military</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Scientific</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Technological</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Cultural</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <span className="font-semibold">Economic</span>
              </div>
            </div>

            <h2>Difficulty Levels</h2>
            <p>Choose from four difficulty levels:</p>
            <table className="min-w-full border-collapse my-4">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Level
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Description
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                    Score Multiplier
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Easy</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Well-known historical events from modern history
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1x</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Medium</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    A mix of well-known and less familiar events spanning wider time periods
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1.5x</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Hard</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    More obscure events across a wide range of time periods
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">2x</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Expert</td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                    Specialized historical knowledge with events that may be very close in time
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">3x</td>
                </tr>
              </tbody>
            </table>

            <h2>Educational Benefits</h2>
            <p>History Time helps players:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Improve memory of historical events and their chronology</li>
              <li>Understand the relationship between different historical periods</li>
              <li>Learn about the causes and effects of major world events</li>
              <li>Develop critical thinking skills by analyzing historical context</li>
              <li>Make learning about history engaging and fun</li>
            </ul>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md"
              >
                Start Playing Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
