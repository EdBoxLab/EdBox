'use client';
import React, { useState } from 'react';
import type { GitHubRepository, GitHubCommit, GitHubFile } from './types';

interface SourceControlViewProps {
    repo: GitHubRepository;
    commits: GitHubCommit[];
    modifiedFiles: GitHubFile[];
    onCommitAndPush: (message: string) => Promise<void>;
}

const CommitHistory: React.FC<{ commits: GitHubCommit[] }> = ({ commits }) => (
    <div className="space-y-4">
        {commits.map(commitData => (
            <div key={commitData.sha} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">commit {commitData.sha.substring(0, 12)}</p>
                <p className="text-slate-900 dark:text-white my-1">{commitData.commit.message}</p>
                <div className="flex items-center">
                   {commitData.author?.avatar_url && <img src={commitData.author.avatar_url} alt={commitData.commit.author.name} className="w-5 h-5 rounded-full mr-2" />}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">{commitData.commit.author.name}</span> committed on {new Date(commitData.commit.author.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
        ))}
    </div>
);


export const SourceControlView: React.FC<SourceControlViewProps> = ({ repo, commits, modifiedFiles, onCommitAndPush }) => {
    const [commitMessage, setCommitMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const canCommit = modifiedFiles.length > 0 && commitMessage.trim() !== '';

    const handleCommit = async () => {
        if (!canCommit || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onCommitAndPush(commitMessage);
            setCommitMessage('');
            // Optionally, you might want to switch tabs or show a success message
            setActiveTab('history'); 
        } catch (error) {
            // Handle error (e.g., show a notification)
            console.error("Failed to commit and push:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8 text-slate-700 dark:text-slate-300">
            <div className="flex-shrink-0 mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{repo.name} - Source Control</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Branch: <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md text-indigo-500 dark:text-indigo-300">{repo.default_branch}</span></p>
            </div>
            
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 mb-4">
                <button onClick={() => setActiveTab('changes')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'changes' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    Changes ({modifiedFiles.length})
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    History ({commits.length})
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'changes' && (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Staged Changes</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6 min-h-[100px]">
                            {modifiedFiles.length > 0 ? (
                                <ul>
                                    {modifiedFiles.map(file => (
                                        <li key={file.path}>
                                            <span className="text-yellow-600 dark:text-yellow-400 font-mono text-sm">
                                                M {file.path}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500">No local changes detected.</p>
                            )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Commit & Push</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                             <textarea
                                value={commitMessage}
                                onChange={(e) => setCommitMessage(e.target.value)}
                                placeholder="Commit message..."
                                className="w-full bg-slate-200 dark:bg-slate-700 rounded-md py-2 px-4 text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={3}
                            />
                            <button
                                onClick={handleCommit}
                                disabled={!canCommit || isSubmitting}
                                className="mt-4 w-full bg-green-600 text-white font-semibold py-2.5 rounded-md hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Committing...' : `Commit & Push to '${repo.default_branch}'`}
                            </button>
                        </div>
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="animate-fade-in">
                         <CommitHistory commits={commits} />
                    </div>
                )}
            </div>
        </div>
    );
};