import React, { useState } from 'react';
import { AnalysisReportData, ThematicAnalysis, ConcernLevel, TranslatedContent } from '../types';
import { DownloadIcon, RefreshIcon, BeakerIcon, TranslateIcon } from './icons';
import { Packer } from 'docx';
import { generateDocxFromReport } from '../services/docxService';
import { translateReportToSpanish } from '../services/geminiService';

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
            <p className={labelClasses}>Concern Level</p>
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


const ThematicAnalysisCard: React.FC<{ item: ThematicAnalysis, analysisText: string }> = ({ item, analysisText }) => {
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
            <p className="whitespace-pre-wrap">{analysisText}</p>
        </div>
      </div>
    </div>
  );
};


export const AnalysisReport: React.FC<{ report: AnalysisReportData, onNewAnalysis: () => void; onUpdateReport: (report: AnalysisReportData) => void; }> = ({ report, onNewAnalysis, onUpdateReport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const doc = generateDocxFromReport(report);
        const blob = await Packer.toBlob(doc);
        
        const sanitizedTitle = report.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        const fileName = `ethical_report_${sanitizedTitle}.docx`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error("Failed to export DOCX:", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleTranslate = async () => {
    setTranslationError(null);
    if (lang === 'es') {
        setLang('en');
        return;
    }

    if (report.translated) {
        setLang('es');
        return;
    }

    setIsTranslating(true);
    try {
        const translatedContent = await translateReportToSpanish(report);
        onUpdateReport({ ...report, translated: translatedContent });
        setLang('es');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred during translation.';
        setTranslationError(message);
    } finally {
        setIsTranslating(false);
    }
  };

  const currentOverallSummary = lang === 'es' && report.translated ? report.translated.overallSummary : report.overallSummary;
  const currentConcludingRemarks = lang === 'es' && report.translated ? report.translated.concludingRemarks : report.concludingRemarks;

  return (
    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">Analysis for: <span className="text-blue-600 dark:text-blue-400">{report.title}</span></h2>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <TranslateIcon className="h-5 w-5" />
            {isTranslating ? 'Translating...' : (lang === 'en' ? 'Translate to Spanish' : 'View in English')}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <DownloadIcon className="h-5 w-5" />
            {isExporting ? 'Exporting...' : 'Export to DOCX'}
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 transition-colors"
            aria-label="Start new analysis"
          >
            <RefreshIcon className="h-5 w-5" />
            Analyze Another
          </button>
        </div>
      </div>

       {translationError && (
          <div className="my-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm" role="alert">
              <strong>Translation Failed:</strong> {translationError}
          </div>
        )}

      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Overall Ethical Concern</h3>
        <ConcernIndicator level={report.overallConcernLevel} isOverall={true} />
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 mb-2">Overall Summary</h3>
        <p className="text-blue-700 dark:text-blue-300/90 whitespace-pre-wrap">{currentOverallSummary}</p>
      </div>

      {report.thematicAnalysis?.length > 0 && (
          <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Thematic Analysis</h3>
              {report.thematicAnalysis.map((item, index) => {
                const analysisText = lang === 'es' && report.translated ? report.translated.thematicAnalysis[index]?.analysis || item.analysis : item.analysis;
                return <ThematicAnalysisCard key={index} item={item} analysisText={analysisText} />
              })}
          </div>
      )}

      <div className="mb-6 p-4 bg-slate-200 dark:bg-slate-900/40 rounded-lg">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Concluding Remarks</h3>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentConcludingRemarks}</p>
      </div>

      {report.analysisDate && report.source && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Bibliographic Reference (APA-Style)</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
                  <p className="font-mono text-xs md:text-sm break-words">
                      Polanco, M. ({new Date().getFullYear()}). Ethical Analysis of '{report.source}'. <em>Ethical Media Analyzer</em>. Retrieved {report.analysisDate}, from this application.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};