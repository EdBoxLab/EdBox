// GitHub repository type
export interface GitHubRepository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    description: string | null; // GitHub API allows null
    owner: {
      login: string;
      id: number;
      avatar_url: string;
      html_url: string;
    };
    default_branch: string;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    license: {
      key: string;
      name: string;
      url: string | null;
      spdx_id: string | null;
      node_id: string;
      html_url?: string;
    } | null;
  }
  
  // GitHub file type
  export interface GitHubFile {
    type: "file" | "dir" | "submodule" | "symlink"; // expanded to match API
    size: number;
    name: string;
    path: string;
    content?: string;
    sha: string;
    url: string;
    git_url: string | null;
    html_url: string | null;
    download_url: string | null;
    _links: {
      self: string;
      git: string | null;
      html: string | null;
    };
  }
  
  // GitHub commit type
  export interface GitHubCommit {
    sha: string;
    commit: {
      message: string;
      author: {
        name: string;
        email: string;
        date: string;
      };
    };
    author: {
        login: string;
        avatar_url: string;
    } | null;
  }
  
  // Local file changes type
  export type LocalFileChanges = {
    [path: string]: {
      original: string;
      modified: string;
    };
  };
  
  // Section type
  export interface Section {
    id: string;
    name: string;
    icon: React.ComponentType<{ size?: number | string; stroke?: number | string; className?: string; }>;
  }

  // Project type for sample projects
  export interface Project {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    techStack: string[];
    githubUrl: string;
  }

  // Extension type
  export interface Extension {
    id: string;
    name: string;
    description: string;
    installed: boolean;
    icon: string;
    publisher: string;
  }

  // Chat message type
  export interface ChatMessage {
    sender: 'user' | 'genie';
    text: string;
    timestamp: number;
  }
  