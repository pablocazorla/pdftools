import type { ToolType } from '../../types/index';

export interface ToolTheme {
  name: string;
  // Icon and badge colors
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  // Card hover states (flat colors with shadow)
  cardHoverBorder: string;
  cardHoverShadow: string;
  textHover: string;
  // Tool action button
  actionBtn: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
}

export const TOOL_THEMES: Record<ToolType, ToolTheme> = {
  'pdf-to-images': {
    name: 'amber',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    iconBorder: 'border-amber-500/20',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    cardHoverBorder: 'hover:border-amber-500/60',
    cardHoverShadow: 'hover:shadow-amber-500/10',
    textHover: 'group-hover:text-amber-400',
    actionBtn: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/25',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-500/10',
  },
  'extract-pdf-images': {
    name: 'rose',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    iconBorder: 'border-rose-500/20',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/20',
    cardHoverBorder: 'hover:border-rose-500/60',
    cardHoverShadow: 'hover:shadow-rose-500/10',
    textHover: 'group-hover:text-rose-400',
    actionBtn: 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 shadow-rose-500/25',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500',
    accentBg: 'bg-rose-500/10',
  },
  'images-to-pdf': {
    name: 'emerald',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    iconBorder: 'border-emerald-500/20',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    cardHoverBorder: 'hover:border-emerald-500/60',
    cardHoverShadow: 'hover:shadow-emerald-500/10',
    textHover: 'group-hover:text-emerald-400',
    actionBtn: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-emerald-500/25',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500',
    accentBg: 'bg-emerald-500/10',
  },
  'merge-pdf': {
    name: 'blue',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/20',
    cardHoverBorder: 'hover:border-blue-500/60',
    cardHoverShadow: 'hover:shadow-blue-500/10',
    textHover: 'group-hover:text-blue-400',
    actionBtn: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-blue-500/25',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500',
    accentBg: 'bg-blue-500/10',
  },
  'split-pdf': {
    name: 'purple',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    iconBorder: 'border-purple-500/20',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/20',
    cardHoverBorder: 'hover:border-purple-500/60',
    cardHoverShadow: 'hover:shadow-purple-500/10',
    textHover: 'group-hover:text-purple-400',
    actionBtn: 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700 shadow-purple-500/25',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500',
    accentBg: 'bg-purple-500/10',
  },
  'extract-pdf-text': {
    name: 'cyan',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    iconBorder: 'border-cyan-500/20',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    badgeBorder: 'border-cyan-500/20',
    cardHoverBorder: 'hover:border-cyan-500/60',
    cardHoverShadow: 'hover:shadow-cyan-500/10',
    textHover: 'group-hover:text-cyan-400',
    actionBtn: 'bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 shadow-cyan-500/25',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500',
    accentBg: 'bg-cyan-500/10',
  },
  'pdf-to-word': {
    name: 'indigo',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    iconBorder: 'border-indigo-500/20',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/20',
    cardHoverBorder: 'hover:border-indigo-500/60',
    cardHoverShadow: 'hover:shadow-indigo-500/10',
    textHover: 'group-hover:text-indigo-400',
    actionBtn: 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 shadow-indigo-500/25',
    accentText: 'text-indigo-400',
    accentBorder: 'border-indigo-500',
    accentBg: 'bg-indigo-500/10',
  },
};
