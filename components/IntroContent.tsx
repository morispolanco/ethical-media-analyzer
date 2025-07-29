
import React from 'react';
import { BeakerIcon } from './icons';

export const IntroContent: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                    <BeakerIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome to the Ethical Media Analyzer</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                This tool uses AI to generate a comprehensive ethical analysis of movies, TV series, or video content, helping viewers and creators understand the complex messages in media.
            </p>
            <div className="mt-6 text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">How it Works</h3>
                <ul className="list-disc list-inside space-y-3 text-slate-600 dark:text-slate-300">
                    <li>
                        <strong>Analyze by Title:</strong> Enter the name of a movie or TV series. The AI will research it and produce a detailed ethical report covering themes like language, social representation, and more.
                    </li>
                    <li>
                        <strong>Analyze Video Content:</strong> Provide a YouTube URL or upload an audio/video file. The AI will analyze the transcript for ethical considerations.
                    </li>
                    <li>
                        <strong>Gain Insight:</strong> Use the generated report to reflect on the content you consume or create, fostering a more critical and ethical approach to media.
                    </li>
                </ul>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
                Developed by Dr. Mois Polanco, mp@ufm.edu
            </p>
        </div>
    );
};
