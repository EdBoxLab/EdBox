'use client';
import React, { useState, useMemo, useEffect } from 'react';
import type { GitHubRepository, GitHubFile, LocalFileChanges } from './types';
import { OutputPreview } from './OutputPreview';

interface EditorViewProps {
  repo: GitHubRepository;
  files: GitHubFile[];
  activeFile: GitHubFile | null;
  localChanges: LocalFileChanges;
  installedExtensions: string[];
  onSelectFile: (file: GitHubFile) => void;
  onContentChange: (filePath: string, newContent: string) => void;
  onSetAiContextPrompt: (prompt: string) => void;
  getModifiedStatus: (path: string) => boolean;
}

export const EditorView: React.FC<EditorViewProps> = ({ repo, files, activeFile, onSelectFile, localChanges, onContentChange, getModifiedStatus, installedExtensions, onSetAiContextPrompt }) => {
    // Placeholder content
    return (
        <div className="flex h-full">
            <div className="w-1/4 bg-slate-200 dark:bg-slate-900 p-4 overflow-y-auto">
                <h2 className="font-bold mb-2">Files</h2>
                <ul>
                    {files.map(file => (
                        <li key={file.path} onClick={() => onSelectFile(file)} className={`cursor-pointer p-1 rounded ${activeFile?.path === file.path ? 'bg-teal-500 text-white' : 'hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
                            {file.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-3/4 flex flex-col">
                <div className="flex-1">
                    {activeFile && (
                        <textarea
                            className="w-full h-full p-4 font-mono bg-white dark:bg-black text-black dark:text-white"
                            value={localChanges[activeFile.path]?.modified ?? ''}
                            onChange={(e) => onContentChange(activeFile.path, e.target.value)}
                        />
                    )}
                </div>
                <div className="flex-1 border-t border-slate-300 dark:border-slate-700">
                    <OutputPreview installedExtensions={installedExtensions} files={files} activeFile={activeFile} localChanges={localChanges} />
                </div>
            </div>
        </div>
    );
};
