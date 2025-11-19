'use client';
import React, { useMemo } from 'react';
import type { GitHubFile, LocalFileChanges } from './types';

interface OutputPreviewProps {
    files: GitHubFile[];
    localChanges: LocalFileChanges;
    activeFile: GitHubFile | null;
    installedExtensions: string[];
}

const WelcomeScreen: React.FC = () => (
     <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-8 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Interactive Canvas</h2>
        <p className="mt-2 max-w-sm">
            This panel shows a live preview of your code. Press "Run" to update the preview. Previews may require specific extensions to be installed.
        </p>
    </div>
);

const getRequiredExtension = (fileType: string): string | null => {
    switch (fileType) {
        case 'html': return 'html-preview';
        case 'css': return 'css-injector';
        case 'js': return 'js-runner';
        default: return null;
    }
};

const ExtensionRequired: React.FC<{ extension: string }> = ({ extension }) => (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-8 text-center">
       <div className="text-5xl mb-4">🧩</div>
       <h2 className="text-xl font-bold text-slate-900 dark:text-white">Extension Required</h2>
       <p className="mt-2 max-w-sm">
           To preview this file type, please install the <span className="font-semibold text-indigo-500 dark:text-indigo-400">{extension}</span> extension from the marketplace.
       </p>
   </div>
);

export const OutputPreview: React.FC<OutputPreviewProps> = ({ files, localChanges, activeFile, installedExtensions }) => {

    const requiredExtension = activeFile ? getRequiredExtension(activeFile.name.split('.').pop() || '') : null;
    const hasRequiredExtension = requiredExtension ? installedExtensions.includes(requiredExtension) : true;

    const srcDoc = useMemo(() => {
        const htmlFile = files.find(f => f.path.endsWith('.html'));
        if (!htmlFile) return '';

        const htmlContent = localChanges[htmlFile.path]?.modified;
        if (!htmlContent || !installedExtensions.includes('html-preview')) return '';

        let content = htmlContent;
        
        // Inject CSS
        if (installedExtensions.includes('css-injector')) {
            const cssFiles = files.filter(f => f.path.endsWith('.css'));
            const styles = cssFiles
                .map(f => localChanges[f.path]?.modified)
                .filter(Boolean)
                .map(c => `<style>${c}</style>`).join('\n');
            content = content.replace('</head>', `${styles}</head>`);
        }

        // Inject JS
        if (installedExtensions.includes('js-runner')) {
            const jsFiles = files.filter(f => f.path.endsWith('.js'));
            const scripts = jsFiles
                .map(f => localChanges[f.path]?.modified)
                .filter(Boolean)
                .map(c => `<script>${c}</script>`).join('\n');
            content = content.replace('</body>', `${scripts}</body>`);
        }
        
        return content;
    }, [files, localChanges, installedExtensions]);

    const renderContent = () => {
        if (!activeFile) {
            return <WelcomeScreen />;
        }
        if (!hasRequiredExtension && requiredExtension) {
            return <ExtensionRequired extension={requiredExtension} />;
        }
        if (srcDoc) {
            return (
                <iframe
                    srcDoc={srcDoc}
                    title="Live Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            );
        }
        return <WelcomeScreen />;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
             <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center p-2">
                <div className="text-slate-700 dark:text-slate-300 px-3 py-1 text-sm">
                    Output Preview
                </div>
            </div>
            <div className="flex-1 bg-white">
                {renderContent()}
            </div>
        </div>
    );
};