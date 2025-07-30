
import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, LightbulbIcon } from './icons';

export type AnalysisInput = 
  | { type: 'title'; value: string | null }
  | { type: 'url'; value: string | null }
  | { type: 'file'; value: File | null };

interface InputFormProps {
  onAnalyze: (input: AnalysisInput) => void;
  isLoading: boolean;
  analysisPrompt?: string | null;
}

type Mode = 'title' | 'video';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors";
    const activeClasses = "bg-blue-600 text-white shadow";
    const inactiveClasses = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600";
    return (
        <button onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading, analysisPrompt }) => {
  const [mode, setMode] = useState<Mode>('title');
  const [title, setTitle] = useState<string>('TikTok');
  const [url, setUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (analysisPrompt) {
        setMode('video');
    }
  }, [analysisPrompt]);


  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (file) {
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
        setUrl('');
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'title') {
      onAnalyze({ type: 'title', value: title });
    } else { // mode === 'video'
        if (url) {
            onAnalyze({ type: 'url', value: url });
        } else if (file) {
            onAnalyze({ type: 'file', value: file });
        }
    }
  };

  const isVideoSubmitDisabled = !url && !file;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        {analysisPrompt && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/40 border-l-4 border-blue-400 text-blue-800 dark:text-blue-200" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <LightbulbIcon className="h-6 w-6 text-blue-400 mr-4" />
                    </div>
                    <div>
                         <p className="font-bold">Sugerencia</p>
                         <p>{analysisPrompt}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-center mb-4 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
            <div className="flex space-x-1">
                <TabButton active={mode === 'title'} onClick={() => setMode('title')}>Analizar Título</TabButton>
                <TabButton active={mode === 'video'} onClick={() => setMode('video')}>Analizar Video</TabButton>
            </div>
        </div>

      <form onSubmit={handleSubmit}>
        {mode === 'title' && (
             <div>
                <label htmlFor="series-title" className="block text-lg font-medium text-slate-700 dark:text-slate-300">
                Analizar una Serie o Película
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Introduce el título para un informe ético completo.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                <input
                    id="series-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="p. ej., 'TikTok', 'Black Mirror', o 'Parásito'"
                    className="flex-grow w-full px-4 py-2 text-slate-900 bg-slate-100 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    disabled={isLoading}
                />
                </div>
            </div>
        )}

        {mode === 'video' && (
            <div>
                 <label htmlFor="video-input" className="block text-lg font-medium text-slate-700 dark:text-slate-300">
                    Analizar un Video
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Proporciona una URL de YouTube o sube un archivo de audio/video para analizar su transcripción.
                </p>
                <div className="space-y-4">
                    <input
                        id="video-url"
                        type="text"
                        value={url}
                        onChange={handleUrlChange}
                        placeholder="Introduce la URL de YouTube"
                        className="flex-grow w-full px-4 py-2 text-slate-900 bg-slate-100 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <div className="relative flex items-center justify-center w-full">
                        <hr className="w-full border-slate-300 dark:border-slate-600"/>
                        <span className="absolute px-2 text-sm text-slate-500 bg-white dark:bg-slate-800">O</span>
                    </div>
                    <label htmlFor="file-upload" className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 ${file ? 'border-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className={`w-8 h-8 mb-4 ${file ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} />
                            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Haz clic para subir</span> o arrastra y suelta</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Archivo de audio o video</p>
                        </div>
                        {file && (
                           <div className="absolute bottom-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">{file.name}</div>
                        )}
                        <input id="file-upload" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={isLoading} accept="audio/*,video/*"/>
                    </label>
                </div>
            </div>
        )}

        <div className="mt-6 flex justify-end">
             <button
                type="submit"
                disabled={isLoading || (mode === 'title' && !title) || (mode === 'video' && isVideoSubmitDisabled)}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Analizando...' : 'Analizar'}
            </button>
        </div>
      </form>
    </div>
  );
};
