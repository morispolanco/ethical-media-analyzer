
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm, AnalysisInput } from './components/InputForm';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { analyzeSeries, analyzeTranscript, transcribeAudioFile } from './services/geminiService';
import { getTranscriptFromUrl, transcribeAudioFromUrl } from './services/youtubeService';
import type { AnalysisReportData } from './types';
import { IntroContent } from './components/IntroContent';
import { ExplanationPage } from './components/ExplanationPage';

type Page = 'main' | 'explanation';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [page, setPage] = useState<Page>('main');
  
  const handleAnalyze = useCallback(async (input: AnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIsInitialState(false);
    setPage('main');

    try {
      let report: AnalysisReportData | null = null;
      let sourceName: string = '';

      if (input.type === 'title' && input.value) {
        sourceName = input.value;
        report = await analyzeSeries(input.value);
      } else if (input.type === 'url' && input.value) {
        sourceName = input.value;
        const { transcript, videoId } = await getTranscriptFromUrl(input.value);
        let finalTranscript = transcript;
        if (!finalTranscript) {
            finalTranscript = await transcribeAudioFromUrl(videoId);
        }
        report = await analyzeTranscript(finalTranscript, sourceName);
      } else if (input.type === 'file' && input.value) {
        sourceName = input.value.name;
        const transcript = await transcribeAudioFile(input.value);
        if (!transcript) throw new Error("Could not generate a transcript from the provided file.");
        report = await analyzeTranscript(transcript, sourceName);
      } else {
        throw new Error("No valid input provided. Please enter a title, URL, or select a file.");
      }
      
      const analysisDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      setAnalysisResult({ ...report, analysisDate, source: sourceName });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateReport = (updatedReport: AnalysisReportData) => {
    setAnalysisResult(updatedReport);
  };

  const handleGoHome = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setIsInitialState(true);
    setPage('main');
  }, []);
  
  const handleGoToExplanation = () => setPage('explanation');

  const MainContent = () => (
    <>
      {!analysisResult && <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />}
      
      <div className="mt-8">
        {isInitialState && <IntroContent />}
        {isLoading && <LoadingSpinner message="Analyzing..." />}
        {error && <ErrorMessage message={error} onNewAnalysis={handleGoHome} />}
        {analysisResult && <AnalysisReport report={analysisResult} onNewAnalysis={handleGoHome} onUpdateReport={handleUpdateReport} />}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header onGoHome={handleGoHome} onGoToExplanation={handleGoToExplanation} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
           {page === 'explanation' ? <ExplanationPage onNavigateBack={() => setPage('main')} /> : <MainContent />}
        </div>
      </main>
    </div>
  );
}
