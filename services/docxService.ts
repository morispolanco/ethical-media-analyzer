
import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType
} from 'docx';
import { AnalysisReportData } from '../types';

const createSectionHeading = (text: string) => new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 400, after: 200 },
});

// Helper to create paragraphs from text with newlines
const createParagraphs = (text: string): Paragraph[] => {
    return text.split('\n').map(line => new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        style: "wellSpaced",
    }));
};

export const generateDocxFromReport = (report: AnalysisReportData): Document => {
    
    const thematicSections = report.thematicAnalysis?.length > 0
        ? report.thematicAnalysis.flatMap((item) => [
            new Paragraph({
                children: [new TextRun({ text: item.theme, bold: true, size: 28 })], // 14pt
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 150 },
            }),
            ...createParagraphs(item.analysis),
            new Paragraph({ text: "" }), // spacer
          ])
        : [new Paragraph({ text: "No thematic analysis was provided.", style: "wellSpaced" })];

    const referenceSection: Paragraph[] = [];
    if (report.analysisDate && report.source) {
        referenceSection.push(
            createSectionHeading("Bibliographic Reference (APA-Style)")
        );
        referenceSection.push(
            new Paragraph({
                children: [
                    new TextRun({ text: `Polanco, M. (${new Date().getFullYear()}). `, size: 22 }),
                    new TextRun({ text: `Ethical Analysis of '${report.source}'. `, size: 22 }),
                    new TextRun({ text: `Ethical Media Analyzer`, italics: true, size: 22 }),
                    new TextRun({ text: `. Retrieved ${report.analysisDate}, from this application.`, size: 22 }),
                ],
                style: "wellSpaced",
            })
        );
    }

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "wellSpaced",
                    name: "Well Spaced",
                    basedOn: "Normal",
                    quickFormat: true,
                    run: {
                        size: 22, // 11pt
                    },
                    paragraph: {
                        spacing: { after: 120 }, // 6pt
                        alignment: AlignmentType.JUSTIFIED,
                    },
                },
            ],
        },
        sections: [{
            children: [
                new Paragraph({ text: "Comprehensive Ethical Analysis Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "" }),
                createSectionHeading("Content Analyzed"),
                new Paragraph({ children: [new TextRun({ text: report.title, bold: true, size: 24 })], style: "wellSpaced" }),

                createSectionHeading("Overall Summary"),
                ...createParagraphs(report.overallSummary),

                createSectionHeading("Detailed Thematic Analysis"),
                ...thematicSections,
                
                createSectionHeading("Concluding Remarks"),
                ...createParagraphs(report.concludingRemarks),

                ...referenceSection,
            ],
        }],
    });

    return doc;
};
