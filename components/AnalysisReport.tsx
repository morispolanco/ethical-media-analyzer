
import React, { useState } from 'react';
import { AnalysisReportData, ThematicAnalysis } from '../types';
import { DownloadIcon, RefreshIcon, BeakerIcon } from './icons';
import { Packer } from 'docx';
import { generateDocxFromReport } from '../services/docxService';

const ThematicAnalysisCard: React.FC<{ item: ThematicAnalysis }> = ({ item }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                <BeakerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="ml-3 text-xl font-semibold text-slate-800 dark:text-slate-100">{item.theme}</h3>
        </div>
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p className="whitespace-pre-wrap">{item.analysis}</p>
        </div>
      </div>
    </div>
  );
};


export const AnalysisReport: React.FC<{ report: AnalysisReportData, onNewAnalysis: () => void; }> = ({ report, onNewAnalysis }) => {
  const [isExporting, setIsExporting] = useState(false);

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
        // In a real app, you might want to show a user-facing error message here.
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-inner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">Analysis for: <span className="text-blue-600 dark:text-blue-400">{report.title}</span></h2>
        <div className="flex items-center gap-3 flex-shrink-0">
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

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300 mb-2">Overall Summary</h3>
        <p className="text-blue-700 dark:text-blue-300/90 whitespace-pre-wrap">{report.overallSummary}</p>
      </div>

      {report.thematicAnalysis?.length > 0 && (
          <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Thematic Analysis</h3>
              {report.thematicAnalysis.map((item, index) => <ThematicAnalysisCard key={index} item={item} />)}
          </div>
      )}

      <div className="mb-6 p-4 bg-slate-200 dark:bg-slate-900/40 rounded-lg">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-2">Concluding Remarks</h3>
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{report.concludingRemarks}</p>
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
