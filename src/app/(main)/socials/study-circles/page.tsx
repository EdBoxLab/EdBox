'use client';

import React, { useState } from 'react';

// Mock data for initial implementation
const mockCircles = [
  { id: '1', name: 'Calculus Crew', members: 12, description: 'Diving deep into derivatives and integrals.' },
  { id: '2', name: 'React Rockstars', members: 8, description: 'Mastering hooks, state, and components.' },
  { id: '3', name: 'Python Pals', members: 23, description: 'From list comprehensions to machine learning.' },
  { id: '4', name: 'History Buffs', members: 5, description: 'Wars, revolutions, and everything in between.' }
];

const mockUserCircles = ['1', '3']; // User is a member of these circles

export default function StudyCirclesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have API calls here to create the circle
    console.log('Creating circle:', { name: newCircleName, description: newCircleDescription });
    // Add to mock data for instant feedback
    const newCircle = {
        id: String(mockCircles.length + 1),
        name: newCircleName,
        description: newCircleDescription,
        members: 1
    };
    mockCircles.push(newCircle);
    mockUserCircles.push(newCircle.id);

    setShowCreateModal(false);
    setNewCircleName('');
    setNewCircleDescription('');
  };

  const userCircles = mockCircles.filter(c => mockUserCircles.includes(c.id));
  const discoverCircles = mockCircles.filter(c => !mockUserCircles.includes(c.id));

  const CircleCard = ({ circle, isMember }: { circle: any, isMember: boolean }) => (
    <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer">
        <h3 className="text-xl font-bold text-purple-400">{circle.name}</h3>
        <p className="text-gray-400 mt-2">{circle.description}</p>
        <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{circle.members} members</span>
            {isMember ? (
                <button className="bg-green-600 text-white py-1 px-3 rounded-full text-sm">Joined</button>
            ) : (
                <button className="bg-purple-600 hover:bg-purple-500 text-white py-1 px-3 rounded-full text-sm">Join</button>
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Study Circles</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Create Circle
          </button>
        </div>

        {/* User's Circles */}
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-400 pl-4">Your Circles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCircles.map(circle => <CircleCard key={circle.id} circle={circle} isMember={true} />)}
            </div>
        </div>

        {/* Discover New Circles */}
        <div>
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-green-400 pl-4">Discover Circles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discoverCircles.map(circle => <CircleCard key={circle.id} circle={circle} isMember={false} />)}
            </div>
        </div>

        {/* Create Circle Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6">Create a New Study Circle</h2>
                    <form onSubmit={handleCreateCircle}>
                        <div className="mb-4">
                            <label htmlFor="circle-name" className="block text-gray-400 mb-2">Circle Name</label>
                            <input 
                                id="circle-name"
                                type="text"
                                value={newCircleName}
                                onChange={e => setNewCircleName(e.target.value)}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="circle-description" className="block text-gray-400 mb-2">Description</label>
                            <textarea
                                id="circle-description"
                                value={newCircleDescription}
                                onChange={e => setNewCircleDescription(e.target.value)}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
