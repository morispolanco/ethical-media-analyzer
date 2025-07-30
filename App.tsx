
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm, AnalysisInput } from './components/InputForm';
import { AnalysisReport } from './components/AnalysisReport';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { analyzeSeries, analyzeTranscript } from './services/geminiService';
import { getTranscriptFromUrl, transcribeAudioFromUrl } from './services/youtubeService';
import { AnalysisReportData, UnknownTitleError } from './types';
import { IntroContent } from './components/IntroContent';
import { ExplanationPage } from './components/ExplanationPage';
import { transcribeAudioFile } from './services/geminiService';


type Page = 'main' | 'explanation';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [page, setPage] = useState<Page>('main');
  const [analysisPrompt, setAnalysisPrompt] = useState<string | null>(null);
  
  const handleAnalyze = useCallback(async (input: AnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setIsInitialState(false);
    setPage('main');
    setAnalysisPrompt(null);

    let caughtError: unknown = null;

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
        if (!transcript) throw new Error("No se pudo generar una transcripción del archivo proporcionado.");
        report = await analyzeTranscript(transcript, sourceName);
      } else {
        throw new Error("No se proporcionó una entrada válida. Por favor, introduce un título, URL o selecciona un archivo.");
      }
      
      const analysisDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      setAnalysisResult({ ...report, analysisDate, source: sourceName });

    } catch (err) {
      caughtError = err;
      if (err instanceof UnknownTitleError) {
        setAnalysisPrompt(err.message);
        setIsLoading(false);
        return; 
      }
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      if (!(caughtError instanceof UnknownTitleError)) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleGoHome = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setIsInitialState(true);
    setPage('main');
    setAnalysisPrompt(null);
  }, []);
  
  const handleGoToExplanation = () => setPage('explanation');

  const MainContent = () => (
    <>
      {!analysisResult && <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} analysisPrompt={analysisPrompt} />}
      
      <div className="mt-8">
        {isInitialState && !analysisPrompt && <IntroContent />}
        {isLoading && <LoadingSpinner message="Analizando..." />}
        {error && <ErrorMessage message={error} onNewAnalysis={handleGoHome} />}
        {analysisResult && <AnalysisReport report={analysisResult} onNewAnalysis={handleGoHome} />}
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
