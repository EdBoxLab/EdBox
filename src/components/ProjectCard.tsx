'use client';

import { Project } from '../lib/constants';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img src={project.imageUrl} alt={project.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
      </div>
    </div>
  );
};