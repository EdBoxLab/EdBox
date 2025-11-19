'use client';

import React from 'react';

// Mock data for initial implementation
const mockCreators = [
    {
        id: '1',
        name: 'Dr. Quantum',
        avatar: 'https://i.pravatar.cc/150?u=drquantum',
        bio: 'Making the complex simple. Specializing in Physics and Mathematics. Join my journey through the cosmos!',
        followers: '1.2M',
        isFollowing: true,
        content: [
            { id: 'c1', type: 'Micro-Course', title: 'Intro to String Theory' },
            { id: 'c2', type: 'Quiz', title: 'Black Hole Physics' },
            { id: 'c3', type: 'Flashcards', title: 'The Standard Model' },
        ]
    },
    {
        id: '2',
        name: 'CodeWizard',
        avatar: 'https://i.pravatar.cc/150?u=codewizard',
        bio: 'Full-stack developer and teacher. From Python to React, I build and I teach. #CodeLife',
        followers: '780K',
        isFollowing: false,
        content: [
            { id: 'c4', type: 'Micro-Course', title: 'Next.js for Beginners' },
            { id: 'c5', type: 'Challenge', title: 'CSS Battle #12' },
            { id: 'c6', type: 'Flashcards', title: 'Data Structures in JS' },
        ]
    },
    {
        id: '3',
        name: 'HistoryBelle',
        avatar: 'https://i.pravatar.cc/150?u=historybelle',
        bio: 'Bringing the past to life. Lover of ancient civilizations and untold stories.',
        followers: '450K',
        isFollowing: true,
        content: [
            { id: 'c7', type: 'Micro-Course', title: 'The Rise of the Roman Empire' },
            { id: 'c8', type: 'Story', title: 'Cleopatra: The Last Pharaoh' },
            { id: 'c9', type: 'Quiz', title: 'WWII Key Battles' },
        ]
    }
];

const FollowButton = ({ isFollowing, onClick }: { isFollowing: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`font-bold py-2 px-6 rounded-full transition-all duration-300 ${isFollowing 
            ? 'bg-gray-700 text-white hover:bg-gray-600' 
            : 'bg-purple-600 text-white hover:bg-purple-500'}`
        }
    >
        {isFollowing ? 'Following' : 'Follow'}
    </button>
);

const CreatorCard = ({ creator }: { creator: any }) => {
    // Dummy state for follow button
    const [isFollowing, setIsFollowing] = React.useState(creator.isFollowing);

    const ContentPill = ({ item }: { item: any }) => (
        <div className="bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 flex items-center">
            <span className="mr-2">{item.type === 'Micro-Course' ? '🎓' : item.type === 'Quiz' ? '❓' : '🗂️'}</span>
            {item.title}
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex items-start">
                    <img src={creator.avatar} alt={creator.name} className="w-20 h-20 rounded-full mr-6" />
                    <div>
                        <h2 className="text-2xl font-bold text-purple-400">{creator.name}</h2>
                        <p className="text-gray-500 font-semibold">{creator.followers} Followers</p>
                    </div>
                </div>
                <FollowButton isFollowing={isFollowing} onClick={() => setIsFollowing(!isFollowing)} />
            </div>
            <p className="mt-4 text-gray-300">{creator.bio}</p>
            <div className="mt-6">
                <h4 className="font-bold text-gray-400 mb-3">Recent Content</h4>
                <div className="flex flex-wrap gap-2">
                    {creator.content.map((item: any) => <ContentPill key={item.id} item={item} />)}
                </div>
            </div>
        </div>
    );
};

export default function CreatorProfilesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Discover Creators
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Follow the best educators and learn directly from the experts.
            </p>
        </div>

        <div className="space-y-8">
            {mockCreators.map(creator => (
                <CreatorCard key={creator.id} creator={creator} />
            ))}
        </div>
      </div>
    </div>
  );
}
