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
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fallback-2",
    title: "Apple presenta avances significativos en su ecosistema de realidad aumentada",
    summary: "Los últimos rumores apuntan a una integración total de servicios en la nube con sus dispositivos de próxima generación.",
    url: "https://cerobit.news",
    source: "CeroBit Tech",
    date: "Hoy",
    category: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fallback-3",
    title: "Nuevos procesadores cuánticos alcanzan hitos de estabilidad",
    summary: "Investigadores logran mantener la coherencia cuántica por periodos extendidos, acercándonos a la computación cuántica comercial.",
    url: "https://cerobit.news",
    source: "CeroBit Science",
    date: "Hoy",
    category: "Hardware",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fallback-4",
    title: "El futuro de la movilidad eléctrica: Baterías de estado sólido",
    summary: "Empresas líderes anuncian pruebas exitosas con baterías que prometen duplicar la autonomía de los vehículos actuales.",
    url: "https://cerobit.news",
    source: "CeroBit Auto",
    date: "Ayer",
    category: "Hardware",
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fallback-5",
    title: "Ciberseguridad en la era de la computación distribuida",
    summary: "Expertos advierten sobre nuevos vectores de ataque y la necesidad de implementar arquitecturas de confianza cero.",
    url: "https://cerobit.news",
    source: "CeroBit Security",
    date: "Ayer",
    category: "Software",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fallback-6",
    title: "Exploración espacial: La próxima frontera del turismo tecnológico",
    summary: "Nuevas alianzas entre agencias espaciales y empresas privadas abren la puerta a viajes orbitales accesibles.",
    url: "https://cerobit.news",
    source: "CeroBit Space",
    date: "Hace 2 días",
    category: "General",
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800"
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
    // Silent fallback
    return STATIC_FALLBACK_NEWS;
  }
}

export async function fetchNewsDetail(item: NewsItem): Promise<string> {
  if (!apiKey) {
    return item.summary;
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
    // Silent fallback to summary if detail generation fails
    return item.summary;
  }
}
