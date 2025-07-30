
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bienvenido al Analizador Ético de Medios</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Esta herramienta utiliza IA para generar un análisis ético exhaustivo de películas, series de televisión o contenido de video, ayudando a espectadores y creadores a comprender los complejos mensajes en los medios.
            </p>
            <div className="mt-6 text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg max-w-2xl mx-auto">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Cómo Funciona</h3>
                <ul className="list-disc list-inside space-y-3 text-slate-600 dark:text-slate-300">
                    <li>
                        <strong>Analizar por Título:</strong> Ingresa el nombre de una película o serie de TV. La IA lo investigará y producirá un informe ético detallado que cubre temas como el lenguaje, la representación social y más.
                    </li>
                    <li>
                        <strong>Analizar Contenido de Video:</strong> Proporciona una URL de YouTube o sube un archivo de audio/video. La IA analizará la transcripción en busca de consideraciones éticas.
                    </li>
                    <li>
                        <strong>Obtén Perspectivas:</strong> Utiliza el informe generado para reflexionar sobre el contenido que consumes o creas, fomentando un enfoque más crítico y ético hacia los medios.
                    </li>
                </ul>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
                Desarrollado por Dr. Mois Polanco, mp@ufm.edu
            </p>
        </div>
    );
};
