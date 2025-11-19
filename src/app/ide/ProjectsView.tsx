import React from 'react';
import type { GitHubRepository } from './types';

interface ProjectCardProps {
  repo: GitHubRepository;
  onSelect: () => void;
  isGuest?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ repo, onSelect, isGuest }) => {
    const owner = !isGuest && repo.owner;

    return (
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
        onClick={onSelect}
      >
        <div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-700">
                {owner ? (
                    <img src={owner.avatar_url} alt={owner.login} className="h-8 w-8 rounded-full" />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">{repo.name}</h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm truncate">{owner ? owner.login : 'Guest'}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 h-10 overflow-hidden">
                {repo.description || 'No description provided.'}
            </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/50">
            <p className={`text-sm font-medium ${repo.private ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                {repo.private ? 'Private' : 'Public'}
            </p>
        </div>
      </div>
    );
};

interface ProjectsViewProps {
  repos: GitHubRepository[];
  onSelectRepo: (repo: GitHubRepository) => void;
  isGuest: boolean;
  isLoading: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ repos, onSelectRepo, isGuest, isLoading }) => {
    return (
        <div className="animate-fade-in p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Projects</h2>
                    <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                      {isGuest ? "Sign in with GitHub to see your repositories." : "Select a repository to open its workspace."}
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="text-center text-slate-500 dark:text-slate-400">Loading repositories...</div>
            )}

            {!isLoading && !isGuest && repos.length === 0 && (
                 <div className="text-center text-slate-500 dark:text-slate-400">No repositories found for your account.</div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {repos.map((repo) => (
                    <ProjectCard key={repo.id} repo={repo} onSelect={() => onSelectRepo(repo)} isGuest={isGuest} />
                ))}
            </div>
        </div>
    );
};