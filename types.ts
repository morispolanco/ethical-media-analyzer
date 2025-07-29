
export interface ThematicAnalysis {
    theme: string;
    analysis: string;
}

export interface AnalysisReportData {
    title: string;
    overallSummary: string;
    thematicAnalysis: ThematicAnalysis[];
    concludingRemarks: string;
    source?: string;
    analysisDate?: string;
}
