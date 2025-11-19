'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GenieAssistantView } from './GenieAssistantView';
import { ProjectsView } from './ProjectsView';
import { EditorView } from './EditorView';
import { SourceControlView } from './SourceControlView';
import { ExtensionsView } from './ExtensionsView';
import { CollaborationView } from './CollaborationView';
import { AuthModal } from '../../lib/auth/AuthModal';
import { useAuth } from '../../lib/auth/AuthContext';
import * as githubService from './services/githubService';
import type {
  Section,
  GitHubRepository,
  GitHubFile,
  GitHubCommit,
  LocalFileChanges,
} from './types';
import { SECTIONS } from './constants';
import { SAMPLE_PROJECTS } from '../../lib/constants';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(SECTIONS[0]);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [activeRepo, setActiveRepo] = useState<GitHubRepository | null>(null);
  const [repoFiles, setRepoFiles] = useState<GitHubFile[]>([]);
  const [activeFile, setActiveFile] = useState<GitHubFile | null>(null);
  const [localChanges, setLocalChanges] = useState<LocalFileChanges>({});
  const [repoCommits, setRepoCommits] = useState<GitHubCommit[]>([]);

  // These are not yet implemented with real APIs, so they remain as local state
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([
    'html-preview',
    'css-injector',
    'js-runner',
  ]);
  const [aiContextPrompt, setAiContextPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !user.isGuest;
  const githubToken = typeof window !== 'undefined' ? localStorage.getItem('githubToken') : null;

  // Reset state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveRepo(null);
      setActiveFile(null);
      setRepositories([]);
      setRepoFiles([]);
      setLocalChanges({});
      setRepoCommits([]);
      setActiveSection(SECTIONS[0]);
    }
  }, [isAuthenticated]);

  const fetchRepos = useCallback(async () => {
    if (isAuthenticated && githubToken) {
      setIsLoading(true);
      setError(null);
      try {
        const userRepos = await githubService.getUserRepos(githubToken);

        // The GitHub API response is already compatible with our type, so we can cast it
        setRepositories(userRepos as GitHubRepository[]);
      } catch (err) {
        setError('Failed to fetch repositories.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, githubToken]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleSelectRepo = async (repo: GitHubRepository) => {
    if (!githubToken) return;
    setIsLoading(true);
    setError(null);
    try {
      setActiveRepo(repo);
      setLocalChanges({});

      const ownerLogin = repo.owner.login;
      const repoName = repo.name;

      const contents = await githubService.getRepoContents(
        githubToken,
        ownerLogin,
        repoName,
        ''
      );
      // Filter out unsupported file types to match the GitHubFile type
      const supportedFiles = contents.filter(
        (item: any) => item.type === 'file' || item.type === 'dir'
      ) as GitHubFile[];
      setRepoFiles(supportedFiles);

      const commits = await githubService.getRepoCommits(githubToken, ownerLogin, repoName);
      setRepoCommits(commits);

      // Select the first file by default, if any
      const firstFile = supportedFiles.find((f) => f.type === 'file');
      if (firstFile) {
        await handleSelectFile(firstFile);
      } else {
        setActiveFile(null);
      }
      setActiveSection(SECTIONS.find((s) => s.id === 'editor')!);
    } catch (err) {
      setError('Failed to load repository contents.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = async (file: GitHubFile) => {
    if (!githubToken || !activeRepo) return;
    setActiveFile(file);
    // Fetch file content if not already fetched or modified
    if (!localChanges[file.path]) {
      setIsLoading(true);
      try {
        const content = await githubService.getFileContent(
          githubToken,
          activeRepo.owner.login,
          activeRepo.name,
          file.path
        );
        const safeContent = content ?? '';
        setLocalChanges((prev) => ({
          ...prev,
          [file.path]: { original: safeContent, modified: safeContent },
        }));
      } catch (err) {
        setError(`Failed to fetch content for ${file.name}.`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleContentChange = (filePath: string, newContent: string) => {
    setLocalChanges((prev) => {
      const existing = prev[filePath];
      return {
        ...prev,
        [filePath]: { original: existing?.original ?? '', modified: newContent },
      };
    });
  };

  const getModifiedFiles = useCallback(() => {
    return Object.entries(localChanges)
      .filter(([_, value]) => value.original !== value.modified)
      .map(([path]) => repoFiles.find((f) => f.path === path))
      .filter((f): f is GitHubFile => f !== undefined);
  }, [localChanges, repoFiles]);

  const handleCommitAndPush = async (message: string) => {
    if (!githubToken || !activeRepo) return;
    const modifiedFiles = getModifiedFiles();
    if (modifiedFiles.length === 0) return;

    setIsLoading(true);
    setError(null);
    try {
      await githubService.commitAndPush({
        token: githubToken,
        owner: activeRepo.owner.login,
        repo: activeRepo.name,
        branch: activeRepo.default_branch,
        commitMessage: message,
        files: modifiedFiles.map((f) => ({
          path: f.path,
          content: localChanges[f.path]?.modified ?? '',
        })),
      });
      // Refresh state after push
      await handleSelectRepo(activeRepo);
    } catch (err) {
      setError('Failed to commit and push changes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToAi = (prompt: string) => {
    setAiContextPrompt(prompt);
    setActiveSection(SECTIONS.find((s) => s.id === 'ai-assistant')!);
  };

  const handleInstallExtension = (id: string) => {
    if (!installedExtensions.includes(id)) {
      setInstalledExtensions([...installedExtensions, id]);
    }
  };

  const handleUninstallExtension = (id: string) => {
    setInstalledExtensions(installedExtensions.filter((extId) => extId !== id));
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="p-8 text-center text-red-600 dark:text-red-400">Error: {error}</div>
      );
    }
    if (isLoading && !activeRepo) {
      return <div className="p-8 text-center">Loading repositories...</div>;
    }

    if (!isAuthenticated) {
      // Adapt sample projects to the GitHubRepository type for consistent rendering
      const sampleReposForView: GitHubRepository[] = SAMPLE_PROJECTS.map((p, index) => ({
        id: -(index + 1), // Use negative IDs to avoid conflicts
        node_id: `mock-node-id-${index}`,
        name: p.name,
        full_name: `guest/${p.name}`,
        description: p.description,
        owner: { 
          login: 'guest', 
          id: -(index + 1),
          avatar_url: '',
          html_url: ''
        }, 
        default_branch: 'main',
        stargazers_count: 0,
        forks_count: 0,
        updated_at: new Date().toISOString(),
        private: false, // Add the private property
        license: null,
      }));

      return (
        <ProjectsView
          repos={sampleReposForView}
          onSelectRepo={() => setAuthModalOpen(true)}
          isGuest={true}
          isLoading={loading}
        />
      );
    }

    switch (activeSection.id) {
      case 'projects':
        return (
          <ProjectsView
            repos={repositories}
            onSelectRepo={handleSelectRepo}
            isGuest={false}
            isLoading={isLoading}
          />
        );
      case 'editor':
        return activeRepo ? (
          <EditorView
            key={activeRepo.id}
            repo={activeRepo}
            files={repoFiles}
            activeFile={activeFile}
            localChanges={localChanges}
            onSelectFile={handleSelectFile}
            onContentChange={handleContentChange}
            installedExtensions={installedExtensions}
            onSetAiContextPrompt={handleNavigateToAi}
            getModifiedStatus={(path) => {
              const change = localChanges[path];
              return change ? change.original !== change.modified : false;
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>Select a project from the 'Projects' tab to start editing.</p>
          </div>
        );
      case 'source-control':
        return activeRepo ? (
          <SourceControlView
            key={activeRepo.id}
            repo={activeRepo}
            commits={repoCommits}
            modifiedFiles={getModifiedFiles()}
            onCommitAndPush={handleCommitAndPush}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>Select a project to view its source control.</p>
          </div>
        );
      case 'extensions':
        return (
          <ExtensionsView
            installedExtensions={installedExtensions}
            onInstallExtension={handleInstallExtension}
            onUninstallExtension={handleUninstallExtension}
          />
        );
      case 'collaboration':
        return <CollaborationView />;
      case 'ai-assistant':
        return (
          <GenieAssistantView
            initialPrompt={aiContextPrompt}
            onPromptHandled={() => setAiContextPrompt(null)}
          />
        );
      default:
        return (
          <ProjectsView
            repos={repositories}
            onSelectRepo={handleSelectRepo}
            isGuest={!isAuthenticated}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={activeSection.name} onSignIn={() => setAuthModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-0 md:p-0 bg-slate-100 dark:bg-slate-800/50">
          {renderContent()}
        </main>
      </div>
      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
};

export default App;
