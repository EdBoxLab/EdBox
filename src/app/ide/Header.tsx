'use client';
import React from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { UserMenu } from '../../lib/auth/UserMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  title: string;
  onSignIn: () => void;
}

const CollaboratorAvatars: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="flex -space-x-2 overflow-hidden">
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
            <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="" />
        </div>
        <button className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700/50 dark:hover:bg-slate-700 h-8 w-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-400 dark:border-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
        </button>
        <button className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300 font-semibold px-4 py-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM4.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14.596 6.464a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM5.404 15.657a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" /></svg>
            Live
        </button>
    </div>
);


export const Header: React.FC<HeaderProps> = ({ title, onSignIn }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user && !user.isGuest;

  return (
    <header className="flex-shrink-0 bg-slate-100/80 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <div className="flex items-center space-x-4">
        {isAuthenticated && <CollaboratorAvatars />}
        <ThemeSwitcher />
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <button 
            onClick={onSignIn}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-500 transition-colors text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};