
import React from 'react';
import { BookOpenIcon } from './icons';

export const Header: React.FC<{ onGoHome: () => void; onGoToExplanation: () => void; }> = ({ onGoHome, onGoToExplanation }) => {
  return (
    <header className="bg-white dark:bg-slate-800/50 shadow-md backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
        <div onClick={onGoHome} className="cursor-pointer">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Ethical Media Analyzer
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
            AI-powered ethical analysis of movies, series, and videos.
          </p>
        </div>
        <button
            onClick={onGoToExplanation}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
            aria-label="View methodology"
          >
            <BookOpenIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Methodology</span>
          </button>
      </div>
    </header>
  );
};
