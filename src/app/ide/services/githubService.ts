import * as OctokitModule from "@octokit/rest";
import type { GitHubCommit } from "../types";

// Helper to create a new Octokit instance with authentication
const getAuthenticatedOctokit = (token: string) => new (OctokitModule as any).Octokit({ auth: token });

/**
 * Fetches repositories for the authenticated user.
 */
export const getUserRepos = async (token: string) => {
    const octokit = getAuthenticatedOctokit(token);
    const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        direction: 'desc',
    });
    return data;
};

/**
 * Fetches the contents of a repository at a specific path.
 */
export const getRepoContents = async (token: string, owner: string, repo: string, path: string = '') => {
    const octokit = getAuthenticatedOctokit(token);
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    return Array.isArray(data) ? data : [data];
};

/**
 * Fetches the content of a single file.
 */
export const getFileContent = async (token: string, owner: string, repo: string, path: string): Promise<string> => {
    const octokit = getAuthenticatedOctokit(token);
    const { data } = await octokit.repos.getContent({ 
        owner, 
        repo, 
        path, 
        mediaType: { format: 'raw' } 
    });
    // The 'raw' media type returns the content directly as a string.
    return data as unknown as string;
};

/**
 * Fetches the commit history for a repository.
 */
export const getRepoCommits = async (token: string, owner: string, repo: string): Promise<GitHubCommit[]> => {
    const octokit = getAuthenticatedOctokit(token);
    const { data } = await octokit.repos.listCommits({ owner, repo });
    return data.map((commit: any) => ({
        sha: commit.sha,
        commit: {
            author: {
                name: commit.commit.author?.name || 'Unknown',
                email: commit.commit.author?.email || 'unknown@example.com',
                date: commit.commit.author?.date || new Date().toISOString(),
            },
            message: commit.commit.message,
        },
        author: {
            login: commit.author?.login || 'unknown',
            avatar_url: commit.author?.avatar_url || ''
        }
    }));
};


interface CommitAndPushOptions {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    commitMessage: string;
    files: { path: string; content: string }[];
}

/**
 * Commits and pushes a set of files to a GitHub repository.
 */
export const commitAndPush = async (options: CommitAndPushOptions) => {
    const { token, owner, repo, branch, commitMessage, files } = options;
    const octokit = getAuthenticatedOctokit(token);

    // 1. Get the current reference for the branch
    const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
    });
    const latestCommitSha = refData.object.sha;

    // 2. Get the tree of the latest commit
    const { data: commitData } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // 3. Create a new tree with the updated file contents
    const { data: treeData } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: files.map(file => ({
            path: file.path,
            mode: '100644', // file (blob)
            type: 'blob',
            content: file.content,
        })),
    });

    // 4. Create a new commit with the new tree
    const { data: newCommitData } = await octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: treeData.sha,
        parents: [latestCommitSha],
    });

    // 5. Update the branch reference to point to the new commit
    await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommitData.sha,
    });
};