'use client';

import { useAuth } from '../lib/auth/AuthContext';

export const UserMenu = () => {
  const { user, signInWithGoogle, signInWithGithub, signOut } = useAuth();

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-600 flex-shrink-0" />
          <div className="hidden sm:block min-w-0">
            <p className="font-semibold text-sm md:text-base text-slate-900 dark:text-white truncate">{user.displayName || 'User'}</p>
            <button onClick={signOut} className="text-xs md:text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Sign Out</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={signInWithGoogle} className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">Sign up</button>
          <button onClick={signInWithGoogle} className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">Sign In</button>
        </div>
      )}
    </div>
  );
};