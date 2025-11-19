
import React from 'react';
import type { Section } from './types';
import { SECTIONS } from './constants';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
}

const Logo: React.FC = () => (
    <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            E
        </div>
        <span className="text-xl font-bold ml-2 text-slate-900 dark:text-white hidden xl:block">EdBox IDE</span>
    </div>
);

const NavItem: React.FC<{ section: Section; isActive: boolean; onClick: () => void }> = ({ section, isActive, onClick }) => {
    const IconComponent = section.icon;
    return (
        <button
          onClick={onClick}
          className={`flex items-center w-full px-4 py-3 transition-colors duration-200 ${
            isActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
          }`}
          title={section.name}
        >
          <IconComponent className="h-6 w-6" />
          <span className="ml-4 font-medium hidden xl:block">{section.name}</span>
        </button>
    );
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="flex flex-col bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-20 xl:w-64">
        <Logo />
        <div className="flex-grow mt-4">
            {SECTIONS.map((section) => (
            <NavItem
                key={section.id}
                section={section}
                isActive={activeSection.id === section.id}
                onClick={() => setActiveSection(section)}
            />
            ))}
        </div>
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 hidden xl:block">
            <p className="text-xs text-slate-500">Version 1.1.0 (Git Enabled)</p>
            <p className="text-xs text-slate-500">System Architecture Plan</p>
        </div>
    </nav>
  );
};