
import React from 'react';
import { ChevronLeftIcon, LightbulbIcon } from './icons';

interface ExplanationPageProps {
  onNavigateBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3 border-b-2 border-blue-500 pb-2">{title}</h2>
        <div className="space-y-4 text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            {children}
        </div>
    </div>
);

const Source: React.FC<{ citation: string }> = ({ citation }) => (
    <li className="ml-4 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
        <p className="text-slate-600 dark:text-slate-400 font-mono text-base">{citation}</p>
    </li>
);

export const ExplanationPage: React.FC<ExplanationPageProps> = ({ onNavigateBack }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Metodología
                </h1>
                <button
                    onClick={onNavigateBack}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
                    aria-label="Volver al analizador"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Volver</span>
                </button>
            </div>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Esta herramienta proporciona un análisis ético de contenido mediático impulsado por IA. Está diseñada como una herramienta complementaria para fomentar el pensamiento crítico, no como un juicio moral o ético definitivo. Así es como funciona.
            </p>

            <Section title="El Motor de IA">
                <p>
                    El núcleo de este analizador es <strong>Gemini 2.5 Flash</strong> de Google, un sofisticado Modelo de Lenguaje Grande (LLM). A la IA se le da un conjunto detallado de instrucciones —un "prompt de sistema"— que la guía para actuar como una experta en ética de los medios. Analiza el título o la transcripción proporcionada basándose en este marco, no en opiniones preexistentes o en una base de datos de reseñas.
                </p>
            </Section>

            <Section title="El Marco Analítico">
                <p>
                    La IA evalúa el contenido a través de varias áreas temáticas clave derivadas de estudios establecidos sobre medios y comunicación. Estos temas incluyen:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4 text-slate-600 dark:text-slate-300">
                    <li><strong>Lenguaje y Comunicación:</strong> Examina el diálogo en busca de respeto, discurso de odio y estilos de comunicación saludables frente a tóxicos.</li>
                    <li><strong>Modelado de Comportamiento:</strong> Analiza si el contenido promueve comportamientos dañinos (p. ej., violencia, abuso de sustancias) o prosociales.</li>
                    <li><strong>Relaciones Sociales:</strong> Evalúa la representación de las relaciones familiares, de amistad y románticas.</li>
                    <li><strong>Representación y Estereotipos:</strong> Evalúa la diversidad de personajes y si el contenido refuerza o desafía estereotipos dañinos.</li>
                    <li><strong>Aspectos Éticos Positivos:</strong> Identifica mensajes prosociales, valores positivos o lecciones éticas.</li>
                    <li><strong>Adecuación al Público Objetivo:</strong> Considera la idoneidad del contenido para diferentes grupos de edad.</li>
                </ul>
            </Section>

            <Section title="La Métrica 'Nivel de Preocupación'">
                <p>
                    El "Nivel de Preocupación" es una puntuación cuantitativa (0-100%) generada por la IA para el contenido general y para cada tema. Representa la evaluación sintetizada del modelo sobre el potencial de problemas éticos.
                </p>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p>
                        Un <strong>porcentaje bajo</strong> sugiere pocas preocupaciones éticas, mientras que un <strong>porcentaje alto</strong> indica la presencia de problemas éticos significativos que pueden requerir precaución y discusión crítica por parte del espectador. Esta métrica es una herramienta para destacar áreas de posible preocupación, no una medida absoluta de calidad o "inmoralidad".
                    </p>
                </div>
            </Section>
            
            <Section title="Descargo de Responsabilidad y Limitaciones">
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <LightbulbIcon className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="font-bold">Consideraciones Importantes</p>
                            <ul className="list-disc list-inside mt-2">
                                <li><strong>La IA es una Herramienta, no un Juez:</strong> El análisis es generado por una IA y puede tener imprecisiones o sesgos.</li>
                                <li><strong>El Contexto es Clave:</strong> La IA puede pasar por alto contextos sutiles, sátira o ironía que un espectador humano entendería.</li>
                                <li><strong>Uso para el Pensamiento Crítico:</strong> Este informe es un punto de partida para la discusión, no un veredicto final. Siempre interactúa con los medios de manera crítica y forma tus propias opiniones informadas.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Lecturas Adicionales y Fuentes">
                 <p>El marco analítico se basa en investigaciones establecidas en efectos de los medios, teoría de la comunicación y ética algorítmica. Para una comprensión más profunda, recomendamos las siguientes fuentes:</p>
                <ul className="space-y-4 mt-4">
                    <Source citation="Noble, S. U. (2018). Algorithms of Oppression: How Search Engines Reinforce Racism. New York University Press." />
                    <Source citation="O'Neil, C. (2016). Weapons of Math Destruction: How Big Data Increases Inequality and Threatens Democracy. Crown." />
                    <Source citation="Potter, W. J. (2019). Media Effects. Sage Publications." />
                    <Source citation="Valkenburg, P. M., & Piotrowski, J. T. (2017). Plugged in: How media shape our lives from toddlers to king agers. Yale University Press." />
                </ul>
            </Section>

             <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                <button
                    onClick={onNavigateBack}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                    Volver al Analizador
                </button>
            </div>
        </div>
    );
};
