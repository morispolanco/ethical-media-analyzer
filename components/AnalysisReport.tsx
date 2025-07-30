
import React, { useState, useEffect } from 'react';
import { AnalysisReportData, ThematicAnalysis } from '../types';
import { DownloadIcon, RefreshIcon, BeakerIcon, ChartBarIcon, BookOpenIcon, ThumbsUpIcon } from './icons';
import { Packer } from 'docx';
import { generateDocxFromReport } from '../services/docxService';
import { generateInfographicSvg } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

const ConcernIndicator: React.FC<{ level: number, isOverall?: boolean }> = ({ level, isOverall = false }) => {
    const getLevelStyles = (percentage: number) => {
        if (percentage <= 33) {
            return { text: 'text-green-800 dark:text-green-300', progress: 'bg-green-500' };
        }
        if (percentage <= 66) {
            return { text: 'text-yellow-800 dark:text-yellow-300', progress: 'bg-yellow-500' };
        }
        return { text: 'text-red-800 dark:text-red-300', progress: 'bg-red-500' };
    };

    const styles = getLevelStyles(level);
    const containerClasses = isOverall ? 'p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50' : '';
    const labelClasses = isOverall ? 'text-sm font-medium text-slate-600 dark:text-slate-400 mb-2' : 'hidden';
    const progressHeight = isOverall ? 'h-4' : 'h-2.5';
    const percentageTextSize = isOverall ? 'text-xl' : 'text-base';
    
    return (
        <div className={containerClasses}>
            <p className={labelClasses}>Nivel de Preocupación</p>
            <div className="flex items-center gap-3 w-full">
                <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full ${progressHeight}`}>
                    <div className={`${styles.progress} ${progressHeight} rounded-full transition-all duration-500`} style={{ width: `${level}%` }}></div>
                </div>
                <span className={`font-bold tabular-nums ${percentageTextSize} ${styles.text}`}>
                    {level}%
                </span>
            </div>
        </div>
    );
};


const ThematicAnalysisCard: React.FC<{ item: ThematicAnalysis }> = ({ item }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full flex-shrink-0">
                  <BeakerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-100">{item.theme}</h3>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px]">
             <ConcernIndicator level={item.concernLevel} />
          </div>
        </div>
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p className="whitespace-pre-wrap">{item.analysis}</p>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    const baseClasses = "inline-flex items-center px-1 py-3 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out focus:outline-none";
    const activeClasses = "border-blue-500 text-blue-600 dark:text-blue-400";
    const inactiveClasses = "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600";
    return (
        <button onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`} aria-current={active ? 'page' : undefined}>
            {children}
        </button>
    )
}

export const AnalysisReport: React.FC<{ report: AnalysisReportData, onNewAnalysis: () => void; }> = ({ report, onNewAnalysis }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [view, setView] = useState<'report' | 'infographic'>('report');
  const [infographicSvg, setInfographicSvg] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState<boolean>(false);
  const [infographicError, setInfographicError] = useState<string | null>(null);

  useEffect(() => {
    if (report && !infographicSvg && !isGeneratingInfographic) {
        const generate = async () => {
            setIsGeneratingInfographic(true);
            setInfographicError(null);
            try {
                const svg = await generateInfographicSvg(report);
                setInfographicSvg(svg);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Ocurrió un error desconocido al generar la infografía.';
                setInfographicError(message);
            } finally {
                setIsGeneratingInfographic(false);
            }
        };
        generate();
    }
  }, [report, infographicSvg, isGeneratingInfographic]);


  const handleExport = async () => {
    setIsExporting(true);
    try {
        const doc = generateDocxFromReport(report);
        const blob = await Packer.toBlob(doc);
        
        const sanitizedTitle = report.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        const fileName = `informe_etico_${sanitizedTitle}.docx`;

        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Failed to export DOCX:", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!infographicSvg) return;
    const sanitizedTitle = report.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const fileName = `infografia_${sanitizedTitle}.svg`;
    const blob = new Blob([infographicSvg], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">Análisis de: <span className="text-blue-600 dark:text-blue-400">{report.title}</span></h2>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <DownloadIcon className="h-5 w-5" />
            {isExporting ? 'Exportando...' : 'Exportar DOCX'}
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-colors"
            aria-label="Iniciar nuevo análisis"
          >
            <RefreshIcon className="h-5 w-5" />
            Analizar Otro
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-slate-300 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <TabButton active={view === 'report'} onClick={() => setView('report')}>
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    Informe Detallado
                </TabButton>
                <TabButton active={view === 'infographic'} onClick={() => setView('infographic')}>
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Infografía
                </TabButton>
            </nav>
        </div>
      </div>

      {view === 'report' && (
        <>
            <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Nivel de Preocupación General</h3>
                <ConcernIndicator level={report.overallConcernLevel} isOverall={true} />
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 mb-2">Resumen General</h3>
                <p className="text-blue-700 dark:text-blue-300/90 whitespace-pre-wrap">{report.overallSummary}</p>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                        <ThumbsUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="font-semibold text-lg text-green-800 dark:text-green-300 mb-2">Aspectos Éticos Positivos Destacados</h3>
                        <p className="text-green-700 dark:text-green-300/90 whitespace-pre-wrap">{report.positiveAspectsSummary}</p>
                    </div>
                </div>
            </div>

            {report.thematicAnalysis?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Análisis Temático de Preocupaciones</h3>
                    {report.thematicAnalysis.map((item, index) => (
                        <ThematicAnalysisCard key={index} item={item} />
                    ))}
                </div>
            )}

            <div className="mb-6 p-4 bg-slate-200 dark:bg-slate-900/40 rounded-lg">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Observaciones Finales</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{report.concludingRemarks}</p>
            </div>

            {report.analysisDate && report.source && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Referencia Bibliográfica (Estilo APA)</h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
                        <p className="font-mono text-xs md:text-sm break-words">
                            Polanco, M. ({new Date().getFullYear()}). Análisis ético de '{report.source}'. <em>Analizador Ético de Medios</em>. Recuperado el {report.analysisDate}, de https://ethical-media-analyzer.vercel.app/
                        </p>
                    </div>
                </div>
            )}
        </>
      )}

      {view === 'infographic' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
          {isGeneratingInfographic && <LoadingSpinner message="Generando Infografía..." />}
          {infographicError && (
              <div className="my-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm" role="alert">
                  <strong>La Generación de la Infografía Falló:</strong> {infographicError}
              </div>
          )}
          {infographicSvg && (
              <div>
                  <div className="flex justify-end mb-4">
                      <button
                          onClick={handleDownloadSvg}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900"
                          aria-label="Descargar infografía como SVG"
                      >
                          <DownloadIcon className="h-5 w-5" />
                          Descargar SVG
                      </button>
                  </div>
                  <div
                      className="w-full h-auto bg-slate-900/50 rounded-lg overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: infographicSvg }}
                  />
              </div>
          )}
        </div>
      )}
    </div>
  );
};