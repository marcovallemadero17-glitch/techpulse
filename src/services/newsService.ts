import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  fullContent?: string;
  url: string;
  source: string;
  date: string;
  category: string;
  imageUrl?: string;
}

const STATIC_FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fallback-1",
    title: "La Inteligencia Artificial revoluciona el desarrollo de software en 2026",
    summary: "Nuevas herramientas de IA permiten a los desarrolladores crear aplicaciones complejas en tiempo récord, transformando la industria tecnológica global.",
    url: "https://cerobit.news",
    source: "CeroBit Editorial",
    date: "Hoy",
    category: "IA",
    imageUrl: "https://picsum.photos/seed/ai-tech/800/600"
  },
  {
    id: "fallback-2",
    title: "Apple presenta avances significativos en su ecosistema de realidad aumentada",
    summary: "Los últimos rumores apuntan a una integración total de servicios en la nube con sus dispositivos de próxima generación.",
    url: "https://cerobit.news",
    source: "CeroBit Tech",
    date: "Hoy",
    category: "Apple",
    imageUrl: "https://picsum.photos/seed/apple-vision/800/600"
  },
  {
    id: "fallback-3",
    title: "Nuevos procesadores cuánticos alcanzan hitos de estabilidad",
    summary: "Investigadores logran mantener la coherencia cuántica por periodos extendidos, acercándonos a la computación cuántica comercial.",
    url: "https://cerobit.news",
    source: "CeroBit Science",
    date: "Hoy",
    category: "Hardware",
    imageUrl: "https://picsum.photos/seed/quantum/800/600"
  }
];

export async function fetchTechNews(category: string): Promise<NewsItem[]> {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Returning static fallback news.");
    return STATIC_FALLBACK_NEWS;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Busca las 12 noticias tecnológicas más recientes y relevantes sobre "${category}" en español. 
  Para cada noticia, proporciona un resumen muy breve (1-2 frases).
  
  Responde ÚNICAMENTE con un objeto JSON siguiendo este esquema:
  {
    "news": [
      {
        "id": "string (slug único)",
        "title": "string",
        "summary": "string (breve)",
        "url": "string",
        "source": "string",
        "date": "string",
        "category": "string",
        "imageUrl": "string"
      }
    ]
  }`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });
    } catch (searchError: any) {
      // Fallback si falla la búsqueda por cuota
      if (searchError.message?.includes("429") || searchError.status === "RESOURCE_EXHAUSTED") {
        console.warn("Search grounding quota exceeded, falling back to internal knowledge.");
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt + "\n(IMPORTANTE: La búsqueda en tiempo real no está disponible, usa tu conocimiento interno más reciente para generar noticias plausibles y actuales)",
          config: {
            responseMimeType: "application/json",
          },
        });
      } else {
        throw searchError;
      }
    }

    const text = response.text;
    if (!text) return STATIC_FALLBACK_NEWS;

    // Limpiar posibles bloques de código markdown
    const cleanJson = text.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    const newsItems = (data.news || []).map((item: any, index: number) => ({
      ...item,
      id: item.id || `news-${category}-${index}-${Date.now()}`
    }));

    return newsItems.length > 0 ? newsItems : STATIC_FALLBACK_NEWS;
  } catch (error: any) {
    console.error("Error fetching news list:", error);
    // Si incluso el fallback falla, devolvemos noticias estáticas para no romper la UI
    if (error.message?.includes("429") || error.message?.includes("quota") || error.status === "RESOURCE_EXHAUSTED") {
      console.warn("Total API quota exceeded, returning static fallback news.");
      return STATIC_FALLBACK_NEWS;
    }
    return STATIC_FALLBACK_NEWS;
  }
}

export async function fetchNewsDetail(item: NewsItem): Promise<string> {
  if (!apiKey) {
    return "Límite de API alcanzado. No se puede generar el detalle en este momento ya que no se ha configurado la clave de API en el entorno de despliegue.";
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Basándote en esta noticia: "${item.title}" de ${item.source} (${item.url}).
  Genera un artículo detallado y extenso (mínimo 5-6 párrafos) en español y formato Markdown para que el usuario lo lea en mi sitio web.
  Incluye subtítulos, puntos clave y un análisis profundo. No inventes datos, usa la información disponible en la web si es necesario.`;

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
    } catch (searchError: any) {
      if (searchError.message?.includes("429") || searchError.status === "RESOURCE_EXHAUSTED") {
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt + "\n(Nota: Genera el contenido basado en tu conocimiento interno ya que la búsqueda no está disponible)",
        });
      } else {
        throw searchError;
      }
    }

    return response.text || "No se pudo generar el contenido detallado.";
  } catch (error: any) {
    console.error("Error fetching news detail:", error);
    if (error.message?.includes("429") || error.message?.includes("quota") || error.status === "RESOURCE_EXHAUSTED") {
      return "Límite de búsqueda alcanzado. El contenido mostrado es un resumen generado por IA.";
    }
    return "Error al cargar el contenido detallado.";
  }
}
