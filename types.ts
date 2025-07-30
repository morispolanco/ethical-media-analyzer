export type ConcernLevel = number;

export interface ThematicAnalysis {
    theme: string;
    analysis: string;
    concernLevel: ConcernLevel;
}

export interface TranslatedContent {
    overallSummary: string;
    thematicAnalysis: { analysis: string }[];
    concludingRemarks: string;
}

export interface AnalysisReportData {
    title: string;
    overallSummary: string;
    thematicAnalysis: ThematicAnalysis[];
    concludingRemarks: string;
    overallConcernLevel: ConcernLevel;
    source?: string;
    analysisDate?: string;
    translated?: TranslatedContent;
}