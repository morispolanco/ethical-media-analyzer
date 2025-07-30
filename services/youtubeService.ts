
/**
 * Extracts the YouTube video ID from various URL formats.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
export const getVideoId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
if (videoId) {
                return videoId;
            }
        }
    } catch (e) {
        // Fallback for non-URL strings or malformed URLs
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// A database of pre-existing transcripts to demonstrate finding an existing transcript.
const cannedTranscripts: { [key: string]: string } = {
  "m_esT_wowGA": `
    (Escena: Una colorida sala de juegos. Steve juega con bloques. Maggie, una marioneta de urraca, entra volando.)
    Steve: ¡Hola Maggie! ¿Qué hacemos hoy?
    Maggie: ¡Juguemos al escondite! ¡Tú cuentas!
    Steve: ¡Vale! Uno... dos... ¡uy! (Steve se tropieza con un bloque y cae suavemente). Oh, qué torpe soy.
    Maggie: (Aparece detrás de una silla) ¡Tonto Steve! ¡Tonto Steve! ¡Te caíste!
    Steve: (Riendo) Oh Maggie, me encontraste. Sí, qué tonto soy. ¡Ahora me toca a mí encontrarte!
    (Más tarde, en un video casero enviado por un espectador)
    Padre: (Fuera de cámara) ¿Qué pasó, cariño?
    Niño: (Un niño de 4 años señala a su padre que acaba de dejar caer las llaves)
    Niño: ¡Tonto papá! ¡Tonto papá! ¡Como dice Maggie!
    Padre: (Suspira) Ay, Dios.
    `,
};

/**
 * Checks for a public transcript for a given YouTube URL from a local cache.
 * @param url The URL of the YouTube video.
 * @returns A promise that resolves with the transcript (or null) and video ID.
 */
export const getTranscriptFromUrl = (url: string): Promise<{ transcript: string | null; videoId: string; }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const videoId = getVideoId(url);
      if (!videoId) {
        return reject(new Error("URL de YouTube no válida. Por favor, revisa el formato e inténtalo de nuevo."));
      }
      const transcript = cannedTranscripts[videoId] || null;
      resolve({ transcript, videoId });
    }, 500); // Simulate network delay
  });
};

/**
 * Simulates a server-side process of downloading and transcribing audio from a YouTube URL.
 * In a real application, this would involve a backend service.
 * @param videoId The ID of the YouTube video.
 * @returns A promise that resolves with a generic, plausible transcript.
 */
export const transcribeAudioFromUrl = (videoId: string): Promise<string> => {
    console.log(`Simulando transcripción para el video ID: ${videoId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            // Return a generic transcript to show the process works for any URL.
            resolve("Hola a todos y bienvenidos de nuevo al canal. En el video de hoy, vamos a ver algunos juguetes nuevos e interesantes. El primero es un coche rojo brillante y hace un sonido de 'vroom' muy fuerte. Veamos qué pasa después. Oh, mira, aquí viene un avión azul. Puede volar muy alto en el cielo. Es importante compartir nuestros juguetes y jugar bien juntos. Siempre sé amable con tus amigos.");
        }, 2000); // Simulate longer delay for transcription
    });
};
