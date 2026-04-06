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

export async function fetchTechNews(category: string): Promise<NewsItem[]> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data.news || [];
  } catch (error) {
    console.error("Error fetching news list:", error);
    return [];
  }
}

export async function fetchNewsDetail(item: NewsItem): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Basándote en esta noticia: "${item.title}" de ${item.source} (${item.url}).
  Genera un artículo detallado y extenso (mínimo 5-6 párrafos) en español y formato Markdown para que el usuario lo lea en mi sitio web.
  Incluye subtítulos, puntos clave y un análisis profundo. No inventes datos, usa la información disponible en la web si es necesario.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "No se pudo generar el contenido detallado.";
  } catch (error) {
    console.error("Error fetching news detail:", error);
    return "Error al cargar el contenido detallado.";
  }
}
