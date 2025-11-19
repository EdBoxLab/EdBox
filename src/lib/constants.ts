import type { Project } from '../app/ide/types';

export type { Project };

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Personal Portfolio',
    description: 'A React-based portfolio to showcase your skills and projects.',
    imageUrl: '/placeholder.svg',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    githubUrl: 'https://github.com/example/portfolio',
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'A full-stack application for managing daily tasks and improving productivity.',
    imageUrl: '/placeholder.svg',
    techStack: ['Next.js', 'Node.js', 'MongoDB', 'GraphQL'],
    githubUrl: 'https://github.com/example/task-app',
  },
  {
    id: '3',
    name: 'E-commerce Storefront',
    description: 'A modern, responsive e-commerce platform built with Vue.js and Firebase.',
    imageUrl: '/placeholder.svg',
    techStack: ['Vue.js', 'Firebase', 'Stripe'],
    githubUrl: 'https://github.com/example/ecommerce',
  },
    {
    id: '4',
    name: 'Real-time Chat Application',
    description: 'A WebSocket-based chat app for instant messaging and group conversations.',
    imageUrl: '/placeholder.svg',
    techStack: ['Socket.IO', 'Express', 'React', 'Redis'],
    githubUrl: 'https://github.com/example/chat-app',
  },
  {
    id: '5',
    name: 'AI-Powered Blog Generator',
    description: 'Generate blog posts from prompts using large language models.',
    imageUrl: '/placeholder.svg',
    techStack: ['Python', 'FastAPI', 'OpenAI API', 'SvelteKit'],
    githubUrl: 'https://github.com/example/ai-blog',
  },
  {
    id: '6',
    name: 'Interactive Data Dashboard',
    description: 'Visualize complex datasets with interactive charts and graphs.',
    imageUrl: '/placeholder.svg',
    techStack: ['D3.js', 'React', 'Pandas'],
    githubUrl: 'https://github.com/example/dashboard',
  },
];