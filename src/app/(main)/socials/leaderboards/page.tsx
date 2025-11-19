'use client';

import React, { useState } from 'react';

// Mock data for initial implementation
const mockLeaderboard = {
    daily: [
        { rank: 1, name: 'Alice', xp: '2,500', avatar: 'https://i.pravatar.cc/150?u=alice', streak: 5 },
        { rank: 2, name: 'Bob', xp: '2,310', avatar: 'https://i.pravatar.cc/150?u=bob', streak: 12 },
        { rank: 3, name: 'You', xp: '2,100', avatar: 'https://i.pravatar.cc/150?u=you', streak: 3, isUser: true },
        { rank: 4, name: 'Charlie', xp: '1,980', avatar: 'https://i.pravatar.cc/150?u=charlie', streak: 2 },
        { rank: 5, name: 'David', xp: '1,850', avatar: 'https://i.pravatar.cc/150?u=david', streak: 8 },
    ],
    weekly: [
        { rank: 1, name: 'Bob', xp: '15,400', avatar: 'https://i.pravatar.cc/150?u=bob', streak: 12 },
        { rank: 2, name: 'David', xp: '14,200', avatar: 'https://i.pravatar.cc/150?u=david', streak: 8 },
        { rank: 3, name: 'Alice', xp: '13,900', avatar: 'https://i.pravatar.cc/150?u=alice', streak: 5 },
        { rank: 4, name: 'You', xp: '12,500', avatar: 'https://i.pravatar.cc/150?u=you', streak: 3, isUser: true },
        { rank: 5, name: 'Charlie', xp: '11,800', avatar: 'https://i.pravatar.cc/150?u=charlie', streak: 2 },
    ],
    allTime: [
        { rank: 1, name: 'Eve', xp: '250k', avatar: 'https://i.pravatar.cc/150?u=eve', streak: 150 },
        { rank: 2, name: 'Frank', xp: '231k', avatar: 'https://i.pravatar.cc/150?u=frank', streak: 120 },
        { rank: 3, name: 'Grace', xp: '210k', avatar: 'https://i.pravatar.cc/150?u=grace', streak: 95 },
        { rank: 4, name: 'You', xp: '198k', avatar: 'https://i.pravatar.cc/150?u=you', streak: 3, isUser: true },
        { rank: 5, name: 'Heidi', xp: '185k', avatar: 'https://i.pravatar.cc/150?u=heidi', streak: 88 },
    ]
};

const mockCircleLeaderboard = [
    { rank: 1, name: 'Calculus Crew', xp: '50,000' },
    { rank: 2, name: 'React Rockstars', xp: '45,000' },
    { rank: 3, name: 'Python Pals', xp: '42,000' },
];

const LeaderboardRow = ({ entry }: { entry: any }) => (
    <div className={`flex items-center p-3 rounded-lg transition-all ${entry.isUser ? 'bg-purple-600 scale-105' : 'bg-gray-800'}`}>
        <span className={`font-bold text-lg w-10 ${entry.rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{entry.rank}</span>
        <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full mx-4" />
        <span className="flex-grow font-semibold text-white">{entry.name}</span>
        <div className="flex items-center text-yellow-400 mr-4">
            <span className="font-bold mr-1">🔥</span> {entry.streak}
        </div>
        <span className="font-bold text-lg text-cyan-400">{entry.xp} XP</span>
    </div>
);

const CircleLeaderboardRow = ({ entry }: { entry: any }) => (
     <div className="flex items-center p-3 rounded-lg bg-gray-800">
        <span className={`font-bold text-lg w-10 ${entry.rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{entry.rank}</span>
        <span className="flex-grow font-semibold text-white ml-4">{entry.name}</span>
        <span className="font-bold text-lg text-cyan-400">{entry.xp} XP</span>
    </div>
);

export default function LeaderboardsPage() {
  const [timeframe, setTimeframe] = useState('daily');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Leaderboards
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                See how you stack up against the competition.
            </p>
        </div>

        {/* Individual Leaderboard */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Top Learners</h2>
            <div className="flex justify-center mb-6 bg-gray-900 rounded-full p-1">
                <button onClick={() => setTimeframe('daily')} className={`px-6 py-2 rounded-full font-semibold ${timeframe === 'daily' ? 'bg-purple-600' : ''}`}>Daily</button>
                <button onClick={() => setTimeframe('weekly')} className={`px-6 py-2 rounded-full font-semibold ${timeframe === 'weekly' ? 'bg-purple-600' : ''}`}>Weekly</button>
                <button onClick={() => setTimeframe('allTime')} className={`px-6 py-2 rounded-full font-semibold ${timeframe === 'allTime' ? 'bg-purple-600' : ''}`}>All-Time</button>
            </div>
            <div className="space-y-2">
                {mockLeaderboard[timeframe as keyof typeof mockLeaderboard].map(entry => <LeaderboardRow key={entry.rank} entry={entry} />)}
            </div>
        </div>

        {/* Circle Leaderboard */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Top Study Circles</h2>
            <div className="space-y-2">
                {mockCircleLeaderboard.map(entry => <CircleLeaderboardRow key={entry.rank} entry={entry} />)}
            </div>
        </div>

      </div>
    </div>
  );
}
