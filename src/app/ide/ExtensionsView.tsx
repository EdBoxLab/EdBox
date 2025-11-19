'use client';
import React from 'react';
import type { Extension } from './types';
import { SAMPLE_EXTENSIONS } from './constants';

interface ExtensionCardProps {
  extension: Extension;
  onInstall: () => void;
  onUninstall: () => void;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension, onInstall, onUninstall }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg flex items-start space-x-4">
        <div className="text-4xl">{extension.icon}</div>
        <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{extension.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{extension.description}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Publisher: {extension.publisher}</p>
        </div>
        <div className="flex-grow" />
        {extension.installed ? (
            <button onClick={onUninstall} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm">
                Uninstall
            </button>
        ) : (
            <button onClick={onInstall} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded text-sm">
                Install
            </button>
        )}
    </div>
);

interface ExtensionsViewProps {
  installedExtensions: string[];
  onInstallExtension: (id: string) => void;
  onUninstallExtension: (id: string) => void;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({ installedExtensions, onInstallExtension, onUninstallExtension }) => {
  const extensions = SAMPLE_EXTENSIONS.map(ex => ({ ...ex, installed: installedExtensions.includes(ex.id) }));

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white">Extension Marketplace</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 md:mb-8">
          Enhance your coding experience by installing extensions.
        </p>
        
        <div className="space-y-4">
          {extensions.map(extension => (
            <ExtensionCard 
              key={extension.id} 
              extension={extension} 
              onInstall={() => onInstallExtension(extension.id)}
              onUninstall={() => onUninstallExtension(extension.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};