

import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReportData, UnknownTitleError } from '../types';

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
            description: "El título de la película, serie o video/documento fuente que se está analizando."
        },
        overallSummary: {
            type: Type.STRING,
            description: "Un breve resumen ejecutivo de un párrafo sobre el panorama ético general del contenido. Si no se encuentra información sobre el título, este campo debe contener exactamente el texto 'No se encontró información concluyente sobre el título proporcionado.'."
        },
        overallConcernLevel: {
            type: Type.INTEGER,
            description: "Una evaluación general del nivel de preocupación ética, como un porcentaje de 0 (sin preocupación) a 100 (preocupación máxima)."
        },
        thematicAnalysis: {
            type: Type.ARRAY,
            description: "Una lista de análisis detallados para diferentes temas de preocupación ética. No incluir temas positivos aquí. Si no se encontró información sobre el título, este debe ser un array vacío.",
            items: {
                type: Type.OBJECT,
                properties: {
                    theme: {
                        type: Type.STRING,
                        description: "El nombre del tema de preocupación ética que se analiza (p. ej., 'Lenguaje y Comunicación', 'Representación y Discriminación')."
                    },
                    analysis: {
                        type: Type.STRING,
                        description: "Un análisis detallado de varias frases para este tema de preocupación específico."
                    },
                    concernLevel: {
                        type: Type.INTEGER,
                        description: "Evaluación de la preocupación ética para este tema específico, como un porcentaje de 0 (sin preocupación) a 100 (preocupación máxima)."
                    }
                },
                required: ["theme", "analysis", "concernLevel"]
            }
        },
        positiveAspectsSummary: {
            type: Type.STRING,
            description: "Un resumen en un párrafo de los aspectos éticos positivos, mensajes prosociales o valores constructivos identificados en el contenido. Si no hay ninguno, indica que no se encontraron aspectos positivos notables."
        },
        concludingRemarks: {
            type: Type.STRING,
            description: "Reflexiones finales que resumen las principales fortalezas y debilidades éticas, y proporcionan una evaluación general."
        }
    },
    required: ["title", "overallSummary", "overallConcernLevel", "thematicAnalysis", "positiveAspectsSummary", "concludingRemarks"]
};

const seriesAnalysisSystemInstruction = `Eres un experto en ética de los medios, sociología y estudios culturales. Tu tarea es realizar un análisis ético exhaustivo de una película o serie de televisión dada. Tu análisis debe ser completo, equilibrado y considerar múltiples puntos de vista. Todo el resultado debe estar en español.

Si NO PUEDES encontrar ninguna información concluyente o confiable sobre el título proporcionado, DEBES generar un informe con las siguientes características:
- 'title': El título que te proporcionó el usuario.
- 'overallSummary': El texto exacto 'No se encontró información concluyente sobre el título proporcionado.'.
- 'overallConcernLevel': 0
- 'thematicAnalysis': Un array vacío [].
- 'positiveAspectsSummary': 'No aplicable debido a la falta de información.'
- 'concludingRemarks': 'No aplicable debido a la falta de información.'

Si SÍ encuentras información, analiza el título y genera un informe detallado. Concéntrate en las siguientes áreas clave para identificar PREOCUPACIONES en 'thematicAnalysis':
1.  **Lenguaje y Comunicación**: Evalúa el diálogo. ¿Es respetuoso? ¿Contiene blasfemias excesivas, discurso de odio o términos despectivos?
2.  **Modelado de Comportamiento y Actitudes**: Analiza los comportamientos, valores y actitudes promovidos por los personajes. ¿El programa glorifica la violencia, el abuso de sustancias u otros comportamientos dañinos?
3.  **Socialización y Relaciones Interpersonales**: Examina cómo se retratan las relaciones. ¿Modela el programa una resolución de conflictos saludable?
4.  **Representación, Estereotipos y Discriminación**: Evalúa la diversidad de personajes. ¿El programa refuerza estereotipos dañinos?
5.  **Adecuación al Público Objetivo**: Basado en tu análisis, discute la idoneidad de la serie para diferentes grupos de edad.

De forma separada, en el campo 'positiveAspectsSummary', resume cualquier mensaje prosocial, valores positivos o lecciones éticas que la serie pueda ofrecer.

Basado en tu análisis completo, asigna un 'overallConcernLevel' como un porcentaje (0-100). Para cada ítem en 'thematicAnalysis', asigna un 'concernLevel' como un porcentaje (0-100). Un porcentaje más alto indica un mayor nivel de preocupación ética.

Tu respuesta DEBE ser un único objeto JSON crudo que se ajuste al esquema proporcionado. No agregues ningún texto antes o después del objeto JSON, y no uses formato markdown como \`\`\`json.`;

const transcriptAnalysisSystemInstruction = `Eres un experto en ética de los medios y comunicación. Tu tarea es realizar un análisis ético exhaustivo de la transcripción proporcionada. Tu análisis debe ser completo, equilibrado y centrarse en el texto mismo. Todo el resultado debe estar en español.

Analiza la transcripción y genera un informe detallado. Concéntrate en las siguientes áreas clave para identificar PREOCUPACIONES en 'thematicAnalysis':
1.  **Lenguaje y Comunicación**: Evalúa el diálogo. ¿Es respetuoso? ¿Contiene blasfemias, discurso de odio o términos despectivos?
2.  **Modelado de Comportamiento y Actitudes**: Analiza los comportamientos, valores y actitudes promovidos. ¿El texto describe o promueve comportamientos dañinos?
3.  **Socialización y Relaciones Interpersonales**: Examina cómo se describen las relaciones a través del diálogo.
4.  **Representación, Estereotipos y Discriminación**: Evalúa cómo se retratan los diferentes grupos. ¿El texto refuerza estereotipos?

De forma separada, en el campo 'positiveAspectsSummary', resume cualquier mensaje prosocial, valores positivos o lecciones éticas en el texto.

Basado en tu análisis completo, asigna un 'overallConcernLevel' como un porcentaje (0-100). Para cada ítem en 'thematicAnalysis', asigna un 'concernLevel' como un porcentaje (0-100). Un porcentaje más alto indica un mayor nivel de preocupación ética.

Estructura tus hallazgos estrictamente de acuerdo con el esquema JSON proporcionado. El campo 'title' en tu respuesta debe ser el nombre de la fuente proporcionado por el usuario.`;


// Helper to parse AI response
const parseAIResponse = (responseText: string): AnalysisReportData => {
    // The AI might wrap the JSON in markdown backticks. This handles it.
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = (match ? match[1] : responseText).trim();

    let report: AnalysisReportData;
    try {
        report = JSON.parse(jsonText) as AnalysisReportData;
    } catch (e) {
        console.error("Fallo al parsear JSON. Texto crudo:", jsonText);
        throw new Error("La IA devolvió una respuesta que no era un JSON válido. Por favor, inténtalo de nuevo.");
    }
    
    if (!report.title || report.overallSummary === undefined || !Array.isArray(report.thematicAnalysis) || report.concludingRemarks === undefined || typeof report.overallConcernLevel !== 'number' || typeof report.positiveAspectsSummary !== 'string') {
      throw new Error("La respuesta de la IA carece de campos obligatorios o tiene un formato no válido.");
    }
    if (report.thematicAnalysis.some(item => !item.theme || !item.analysis || typeof item.concernLevel !== 'number')) {
        throw new Error("La respuesta de la IA tiene elementos de análisis temático mal formados.");
    }
    return report;
};


export const analyzeSeries = async (seriesTitle: string): Promise<AnalysisReportData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Por favor, genera un análisis ético exhaustivo para la siguiente serie/película: "${seriesTitle}".`,
            config: {
                systemInstruction: seriesAnalysisSystemInstruction,
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: reportSchema,
            },
        });

        const report = parseAIResponse(response.text);

        if (report.overallSummary.includes('No se encontró información concluyente')) {
            throw new UnknownTitleError(`No se encontró información para "${seriesTitle}". Por favor, intenta subir un archivo de muestra para analizar.`);
        }

        return report;

    } catch (error) {
        if (error instanceof UnknownTitleError) {
            throw error;
        }
        console.error("Error al analizar series con la API de Gemini:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error(`La IA devolvió un formato no válido. Esto puede ocurrir con títulos complejos o ambiguos. Por favor, inténtalo de nuevo o reformula el título.`);
        }
        throw new Error(`No se pudo obtener el análisis de la IA: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

export const analyzeTranscript = async (transcript: string, sourceName: string): Promise<AnalysisReportData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `El usuario proporcionó una transcripción de la fuente: "${sourceName}". Por favor, analiza el siguiente contenido: \n\n---\n\n${transcript}`,
            config: {
                systemInstruction: transcriptAnalysisSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: reportSchema,
                temperature: 0.5
            },
        });
        
        return parseAIResponse(response.text);

    } catch (error) {
        console.error("Error al analizar la transcripción con la API de Gemini:", error);
        throw new Error(`Fallo al analizar la transcripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject(new Error("Fallo al leer el archivo."));
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
            contents: { parts: [audioPart, {text: "Transcribe este archivo de audio con precisión. Si el audio no es claro o no contiene voz, devuelve una respuesta vacía."}] },
        });
        return response.text;
    } catch (error) {
        console.error("Error al transcribir archivo de audio:", error);
        throw new Error("Fallo al transcribir audio. El archivo podría no ser compatible, estar corrupto o ser demasiado grande.");
    }
};

export const generateInfographicSvg = async (report: AnalysisReportData): Promise<string> => {
    const infographicPrompt = `
Eres un experto de clase mundial en visualización de datos y diseño gráfico, especializado en crear infografías SVG impresionantes, profesionales y fáciles de leer. Tu tarea es crear una única infografía SVG, autocontenida y muy pulida, basada en los datos JSON proporcionados. El idioma de la infografía debe ser español.

**Brief de Diseño y Requisitos Estrictos:**

1.  **Viewport SVG:** Debe ser exactamente "0 0 800 600".
2.  **Estética General:**
    *   **Tema:** Tema oscuro, elegante y moderno.
    *   **Fondo:** Usa un gradiente radial sutil para el fondo. Defínelo en \`<defs>\`. Ejemplo: \`<radialGradient id="bg-gradient" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="#1e293b" /><stop offset="100%" stop-color="#0f172a" /></radialGradient>\`. Aplícalo a un \`<rect>\` de fondo.
    *   **Fuente:** Usa una fuente sans-serif limpia como 'Inter', 'Helvetica Neue', o 'sans-serif' por defecto.
    *   **Color de Texto:** El color de texto primario debe ser '#e2e8f0'. Texto secundario/etiquetas: '#94a3b8'.
3.  **Accesibilidad:** Incluye etiquetas <title> y <desc> significativas dentro del SVG para lectores de pantalla.
4.  **Encabezado:**
    *   En la parte superior (coordenada y alrededor de 45), muestra el título principal: "Análisis Ético: ${report.title}".
    *   Tamaño de fuente: 28px, font-weight: bold, text-anchor: middle, posición: x="400".
    *   Debajo del título (coordenada y alrededor de 70), añade un subtítulo: "Resumen de Posibles Preocupaciones". Tamaño de fuente: 16px, text-anchor: middle, fill: '#94a3b8'.
5.  **Diseño (2 columnas, con amplios márgenes laterales, comenzando desde y=100):**
    *   **Columna Izquierda (área de contenido aprox. x=40 a x=360):**
        *   **Gráfico de Medidor (MUY IMPORTANTE):** Para mostrar el "Nivel de Preocupación General", DEBES usar la técnica \`stroke-dasharray\`. Es la forma más robusta de garantizar la precisión.
            *   Define un radio grande, \`r="100"\`. El centro del círculo debe estar en \`cx="200"\`, \`cy="250"\`.
            *   Calcula la circunferencia: \`2 * Math.PI * 100\` (aprox. 628).
            *   Dibuja un \`<circle>\` para la pista de fondo. \`fill="none"\`, \`stroke="#334155"\`, \`stroke-width="25"\`.
            *   Dibuja un segundo \`<circle>\` para el progreso encima del primero. \`fill="none"\`, \`stroke-width="25"\`. El color del trazo (\`stroke\`) DEBE ser dinámico: 0-33 es verde ('#22c55e'), 34-66 es amarillo ('#eab308'), 67-100 es rojo ('#ef4444').
            *   Aplica la técnica de guiones: \`stroke-dasharray="628"\` y \`stroke-dashoffset\` debe ser \`628 * (1 - ${report.overallConcernLevel} / 100)\`.
            *   Añade \`transform="rotate(-90 200 250)"\` a ambos círculos para que el 0% comience en la parte superior.
        *   **Texto Central:** Dentro del medidor, muestra el valor porcentual (p. ej., "${report.overallConcernLevel}%"). Posición: \`x="200"\`, \`y="255"\`, \`text-anchor="middle"\`. Tamaño de fuente: 52px, font-weight: bold. El color de relleno (\`fill\`) DEBE coincidir con el color dinámico del trazo del medidor.
        *   **Etiqueta:** Debajo del porcentaje, añade la etiqueta "Preocupación General". Para asegurar que encaje, DEBES usar elementos <tspan> para dividirla en dos líneas: \`<text y="285" font-size="18px" text-anchor="middle" fill="#94a3b8"><tspan x="200" dy="0">Preocupación</tspan><tspan x="200" dy="1.2em">General</tspan></text>\`.
    *   **Columna Derecha (área de contenido aprox. x=390 a x=780):**
        *   **Título:** Muestra un título "Desglose Temático" (coordenada y alrededor de 140, x="390", text-anchor="start"). Tamaño de fuente: 20px, font-weight: bold.
        *   **Elementos Temáticos:** Para cada tema en \`thematicAnalysis\` (máximo 5 temas), crea un grupo de elementos. Asegura un espaciado vertical generoso entre cada grupo (p. ej., ~75px desde el inicio de un ítem al siguiente).
        *   **Diseño por Ítem (Pila Vertical, comenzando en x=390):**
            1.  **Nombre del Tema:** Muestra el nombre del tema. Posición: x="390", text-anchor: 'start', fill: '#e2e8f0', font-size: 15px. **Regla de ajuste de texto:** Si el nombre del tema (p. ej., 'Representación y Discriminación') es demasiado largo para caber en una línea, DEBES dividirlo en dos líneas usando elementos \`<tspan>\` para evitar el desbordamiento. Ejemplo: \`<text...><tspan x='390' dy='0'>Representación y</tspan><tspan x='390' dy='1.2em'>Discriminación</tspan></text>\`.
            2.  **Barra con Pista de Fondo:** Debajo del nombre del tema (unos 25px más abajo si es una línea, o 45px si son dos), crea los elementos de la barra.
                *   Primero, dibuja un rectángulo de pista de fondo en x="390" con un \`width="350"\`. Fill: '#334155', height: 18px, esquinas redondeadas (rx="4").
                *   Encima de la pista, dibuja la barra de progreso real que representa el \`concernLevel\`, comenzando en x="390". Su ancho será un porcentaje del ancho de la pista (350px). El color de la barra DEBE ser dinámico según su valor: 0-33 es verde ('#22c55e'), 34-66 es amarillo ('#eab308'), 67-100 es rojo ('#ef4444').
            3.  **Etiqueta de Porcentaje:** A la derecha de la barra de progreso, muestra el valor porcentual (p. ej., "75%"). Posición: x="780", text-anchor="end". Tamaño de fuente: 14px, font-weight: bold. El color de relleno debe coincidir con el color dinámico de la barra de progreso. Esta configuración maximiza el espacio y evita el recorte.
6.  **Pie de Página:**
    *   En la parte inferior del SVG (coordenada y alrededor de 580), añade un pequeño pie de página: "Generado por el Analizador Ético de Medios".
    *   Tamaño de fuente: 12px, fill: '#475569', text-anchor: middle, x="400".
7.  **Salida:**
    *   Responde ÚNICAMENTE con el código SVG crudo y autocontenido.
    *   No incluyas vallas de markdown (\`\`\`svg\`), declaraciones XML (\`<?xml ...>\`), comentarios ni ningún otro texto explicativo.
    *   La respuesta completa DEBE comenzar con \`<svg ...>\` y terminar con \`</svg>\`.

**Datos JSON para la Infografía:**
${JSON.stringify({
    title: report.title,
    overallConcernLevel: report.overallConcernLevel,
    thematicAnalysis: report.thematicAnalysis.slice(0, 5) // Usa un máximo de 5 temas para evitar el desorden
})}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: infographicPrompt,
            config: {
                temperature: 0.1,
            },
        });
        
        let svgText = response.text.trim();
        // Clean up potential markdown fences
        const svgMatch = svgText.match(/<svg.*<\/svg>/s);
        if (svgMatch) {
            svgText = svgMatch[0];
        }

        if (!svgText.startsWith('<svg') || !svgText.endsWith('</svg>')) {
            console.error("Respuesta SVG no válida:", svgText);
            throw new Error("La IA no devolvió una estructura SVG válida.");
        }

        return svgText;

    } catch (error) {
        console.error("Error al generar la infografía con la API de Gemini:", error);
        throw new Error(`Fallo al generar la infografía: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};