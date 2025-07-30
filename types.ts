
export type ConcernLevel = number;

export interface ThematicAnalysis {
    theme: string;
    analysis: string;
    concernLevel: ConcernLevel;
}

export interface AnalysisReportData {
    title: string;
    overallSummary: string;
    thematicAnalysis: ThematicAnalysis[];
    positiveAspectsSummary: string;
    concludingRemarks: string;
    overallConcernLevel: ConcernLevel;
    source?: string;
    analysisDate?: string;
}

export class UnknownTitleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownTitleError';
  }
}
