import * as TablerIcons from '@tabler/icons-react';
import type { Section, Extension } from './types';

const { IconCode, IconGitCompare, IconPuzzle, IconUsers, IconBrain } = TablerIcons as any;

export const SECTIONS: Section[] = [
    { id: 'editor', name: 'Code Editor', icon: IconCode },
    { id: 'source-control', name: 'Source Control', icon: IconGitCompare },
    { id: 'extensions', name: 'Extensions', icon: IconPuzzle },
    { id: 'collaboration', name: 'Collaboration', icon: IconUsers },
    { id: 'ai-assistant', name: 'Genie AI', icon: IconBrain },
];

export const SAMPLE_EXTENSIONS: Extension[] = [
  {
    id: 'html-preview',
    name: 'HTML Preview',
    description: 'Live preview for HTML files.',
    installed: true,
    icon: '🖼️',
    publisher: 'Community',
  },
  {
    id: 'css-injector',
    name: 'CSS Injector',
    description: 'Apply CSS styles to the HTML preview.',
    installed: true,
    icon: '🎨',
    publisher: 'Community',
  },
  {
    id: 'js-runner',
    name: 'JavaScript Runner',
    description: 'Execute JavaScript in the preview context.',
    installed: true,
    icon: '⚡',
    publisher: 'Community',
  },
    {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Quickly insert placeholder text.',
    installed: false,
    icon: '✍️',
    publisher: 'Community',
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'A visual tool for selecting colors.',
    installed: false,
    icon: '🌈',
    publisher: 'Community',
  },
  {
    id: 'prettier-formatter',
    name: 'Prettier Code Formatter',
    description: 'Automatically format your code on save.',
    installed: false,
    icon: '✨',
    publisher: 'Official',
  },
];