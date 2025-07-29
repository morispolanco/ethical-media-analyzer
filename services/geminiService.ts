import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisReportData } from '../types';

// Ensure process.env.API_KEY is available. In a real app, this is set by the environment.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const reportSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The title of the movie, series, or source video/document being analyzed."
        },
        overallSummary: {
            type: Type.STRING,
            description: "A brief, one-paragraph executive summary of the overall ethical landscape of the content."
        },
        thematicAnalysis: {
            type: Type.ARRAY,
            description: "A list of detailed analyses for different ethical themes.",
            items: {
                type: Type.OBJECT,
                properties: {
                    theme: {
                        type: Type.STRING,
                        description: "The name of the ethical theme being analyzed (e.g., 'Language and Communication', 'Representation and Discrimination')."
                    },
                    analysis: {
                        type: Type.STRING,
                        description: "A detailed, multi-sentence analysis for this specific theme."
                    }
                },
                required: ["theme", "analysis"]
            }
        },
        concludingRemarks: {
            type: Type.STRING,
            description: "Final concluding thoughts, summarizing the key ethical strengths and weaknesses, and providing an overall assessment."
        }
    },
    required: ["title", "overallSummary", "thematicAnalysis", "concludingRemarks"]
};

const seriesAnalysisSystemInstruction = `You are an expert in media ethics, sociology, and cultural studies. Your task is to perform a comprehensive ethical analysis of a given movie or TV series. Your analysis should be thorough, balanced, and consider multiple viewpoints.

Analyze the provided title and generate a detailed report. Focus on the following key areas:
1.  **Language and Communication**: Evaluate the dialogue. Is it respectful? Does it contain excessive profanity, hate speech, or derogatory terms? Are communication styles healthy or toxic?
2.  **Behavioral Modeling and Attitudes**: Analyze the behaviors, values, and attitudes promoted by the main characters. Are they positive role models? Does the show glorify violence, substance abuse, dishonesty, or other harmful behaviors without showing consequences?
3.  **Socialization and Interpersonal Relationships**: Examine how relationships (family, friendships, romantic) are portrayed. Does the show model healthy conflict resolution, empathy, and cooperation?
4.  **Representation, Stereotyping, and Discrimination**: Assess the diversity of characters. How are different genders, races, ethnicities, sexual orientations, abilities, and socioeconomic groups portrayed? Does the show challenge or reinforce harmful stereotypes?
5.  **Positive Ethical Aspects**: Identify and discuss any pro-social messages, positive values, or ethical lessons the series might offer.
6.  **Target Audience Appropriateness**: Based on your analysis, discuss the suitability of the series for different age groups.

Your response MUST be a single, raw JSON object. Do not add any text before or after the JSON object, and do not use markdown formatting like \`\`\`json. Your response must conform to the following JSON schema:
${JSON.stringify(reportSchema, null, 2)}

Ensure the 'title' in the response matches the title provided in the prompt.`;

const transcriptAnalysisSystemInstruction = `You are an expert in media ethics and communication. Your task is to perform a comprehensive ethical analysis of the provided transcript. Your analysis should be thorough, balanced, and focus on the text itself.

Analyze the transcript and generate a detailed report. Focus on the following key areas based on the provided text:
1.  **Language and Communication**: Evaluate the dialogue. Is it respectful? Does it contain profanity, hate speech, or derogatory terms? Are communication styles healthy or toxic?
2.  **Behavioral Modeling and Attitudes**: Analyze the behaviors, values, and attitudes promoted. Does the text describe or promote harmful behaviors?
3.  **Socialization and Interpersonal Relationships**: Examine how relationships are described or portrayed through dialogue.
4.  **Representation, Stereotyping, and Discrimination**: Assess how different groups or individuals are portrayed. Does the text reinforce stereotypes?
5.  **Positive Ethical Aspects**: Identify and discuss any pro-social messages, positive values, or ethical lessons in the text.

Structure your findings strictly according to the provided JSON schema. The 'title' field in your response should be the source name provided by the user.`;


// Helper to parse AI response
const parseAIResponse = (responseText: string): AnalysisReportData => {
    // The AI might wrap the JSON in markdown backticks. This handles it.
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = (match ? match[1] : responseText).trim();

    let report: AnalysisReportData;
    try {
        report = JSON.parse(jsonText) as AnalysisReportData;
    } catch (e) {
        console.error("Failed to parse JSON. Raw text:", jsonText);
        throw new Error("The AI returned a response that was not valid JSON. Please try again.");
    }
    
    if (!report.title || !report.overallSummary || !Array.isArray(report.thematicAnalysis) || !report.concludingRemarks) {
      throw new Error("AI response is missing required fields or has an invalid format.");
    }
    return report;
};


export const analyzeSeries = async (seriesTitle: string): Promise<AnalysisReportData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please generate a comprehensive ethical analysis for the following series/movie: "${seriesTitle}".`,
            config: {
                systemInstruction: seriesAnalysisSystemInstruction,
                temperature: 0.3,
                tools: [{googleSearch: {}}],
            },
        });

        return parseAIResponse(response.text);

    } catch (error) {
        console.error("Error analyzing series with Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error(`The AI returned an invalid format. This can happen with complex or ambiguous titles. Please try again or rephrase the title.`);
        }
        throw new Error(`Failed to get analysis from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const analyzeTranscript = async (transcript: string, sourceName: string): Promise<AnalysisReportData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user provided a transcript from the source: "${sourceName}". Please analyze the following content: \n\n---\n\n${transcript}`,
            config: {
                systemInstruction: transcriptAnalysisSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: reportSchema,
                temperature: 0.5
            },
        });
        
        return parseAIResponse(response.text);

    } catch (error) {
        console.error("Error analyzing transcript with Gemini API:", error);
        throw new Error(`Failed to analyze transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject(new Error("Failed to read file."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const transcribeAudioFile = async (file: File): Promise<string> => {
    try {
        const audioPart = await fileToGenerativePart(file);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [audioPart, {text: "Transcribe this audio file accurately. If the audio is unclear or contains no speech, return an empty response."}] },
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio file:", error);
        throw new Error("Failed to transcribe audio. The file might be unsupported, corrupted, or too large.");
    }
};