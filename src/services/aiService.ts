import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: "Gratis" | "Freemium" | "Pago";
  url: string;
  imageUrl: string;
  features: string[];
}

export const AI_TOOLS: AITool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "El modelo de lenguaje más popular de OpenAI para conversación, redacción y resolución de problemas complejos.",
    category: "Generación de Texto",
    pricing: "Freemium",
    url: "https://chat.openai.com",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    features: ["Conversación natural", "Redacción de código", "Análisis de datos"]
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Generador de imágenes de alta calidad a partir de texto, conocido por su estilo artístico excepcional.",
    category: "Generación de Imágenes",
    pricing: "Pago",
    url: "https://www.midjourney.com",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    features: ["Alta resolución", "Estilos artísticos", "Comunidad activa"]
  },
  {
    id: "claude",
    name: "Claude AI",
    description: "Asistente de IA de Anthropic enfocado en la seguridad, razonamiento avanzado y procesamiento de contextos largos.",
    category: "Generación de Texto",
    pricing: "Freemium",
    url: "https://claude.ai",
    imageUrl: "https://images.unsplash.com/photo-1676299081847-c0326a0333d5?auto=format&fit=crop&q=80&w=800",
    features: ["Resumen de documentos", "Razonamiento lógico", "Seguridad ética"]
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "Tu compañero de programación con IA que sugiere líneas de código y funciones completas en tiempo real.",
    category: "Programación",
    pricing: "Pago",
    url: "https://github.com/features/copilot",
    imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800",
    features: ["Autocompletado de código", "Soporte multi-lenguaje", "Integración con VS Code"]
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "La tecnología de voz por IA más realista para creadores de contenido, con clonación de voz y TTS avanzado.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://elevenlabs.io",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800",
    features: ["Clonación de voz", "Texto a voz natural", "Soporte multi-idioma"]
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    description: "Herramientas de escritura y organización integradas directamente en tu espacio de trabajo de Notion.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://www.notion.so/product/ai",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    features: ["Resumen de notas", "Edición de texto", "Brainstorming"]
  },
  {
    id: "canva-magic",
    name: "Canva Magic Studio",
    description: "Suite completa de herramientas de diseño con IA para crear presentaciones, redes sociales y más.",
    category: "Generación de Imágenes",
    pricing: "Freemium",
    url: "https://www.canva.com/magic",
    imageUrl: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800",
    features: ["Edición mágica", "Generación de texto a imagen", "Plantillas inteligentes"]
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "Motor de búsqueda conversacional que proporciona respuestas precisas con fuentes citadas en tiempo real.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://www.perplexity.ai",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    features: ["Búsqueda en tiempo real", "Citas de fuentes", "Interfaz limpia"]
  },
  {
    id: "jasper",
    name: "Jasper",
    description: "Plataforma de IA para creación de contenido de marketing, blogs y redes sociales con voz de marca personalizada.",
    category: "Generación de Texto",
    pricing: "Pago",
    url: "https://www.jasper.ai",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    features: ["Voz de marca", "Campañas de marketing", "Extensión de navegador"]
  },
  {
    id: "copyai",
    name: "Copy.ai",
    description: "Generador de textos para ventas y marketing que ayuda a los equipos a escribir mejor contenido en segundos.",
    category: "Generación de Texto",
    pricing: "Freemium",
    url: "https://www.copy.ai",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    features: ["Chat de IA", "Flujos de trabajo", "Plantillas de copy"]
  },
  {
    id: "leonardo",
    name: "Leonardo.ai",
    description: "Plataforma de generación de activos visuales de alta calidad con control total sobre el estilo y la composición.",
    category: "Generación de Imágenes",
    pricing: "Freemium",
    url: "https://leonardo.ai",
    imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=800",
    features: ["Modelos personalizados", "Edición de lienzo", "Generación 3D"]
  },
  {
    id: "runway",
    name: "Runway Gen-2",
    description: "Sistema de IA multimodal que puede generar videos realistas a partir de texto, imágenes o clips de video.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://runwayml.com",
    imageUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800",
    features: ["Texto a video", "Imagen a video", "Edición profesional"]
  },
  {
    id: "heygen",
    name: "HeyGen",
    description: "Plataforma de video con avatares de IA para crear videos explicativos y de marketing de forma rápida.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://www.heygen.com",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    features: ["Avatares realistas", "Clonación de voz", "Traducción de video"]
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "El editor de código construido para la programación con IA, permitiendo escribir y editar código con lenguaje natural.",
    category: "Programación",
    pricing: "Freemium",
    url: "https://cursor.sh",
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
    features: ["Predicción de código", "Chat integrado", "Importación de VS Code"]
  },
  {
    id: "grammarly",
    name: "Grammarly AI",
    description: "Asistente de escritura que utiliza IA para mejorar la gramática, el tono y la claridad de tus textos.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://www.grammarly.com",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    features: ["Corrección gramatical", "Detección de tono", "Sugerencias de estilo"]
  },
  {
    id: "gamma",
    name: "Gamma App",
    description: "Crea presentaciones, documentos y sitios web hermosos en segundos a partir de un simple prompt de texto.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://gamma.app",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    features: ["Presentaciones con IA", "Diseño responsivo", "Análisis de visualización"]
  },
  {
    id: "replit",
    name: "Replit Ghostwriter",
    description: "Entorno de desarrollo colaborativo con IA que ayuda a escribir, depurar y desplegar aplicaciones.",
    category: "Programación",
    pricing: "Freemium",
    url: "https://replit.com/ai",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
    features: ["Depuración con IA", "Despliegue rápido", "Colaboración en vivo"]
  },
  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    description: "Suite de modelos de IA generativa de Adobe integrada en Photoshop e Illustrator para flujos de trabajo creativos.",
    category: "Generación de Imágenes",
    pricing: "Freemium",
    url: "https://www.adobe.com/firefly",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
    features: ["Relleno generativo", "Efectos de texto", "Recoloreado vectorial"]
  },
  {
    id: "pika",
    name: "Pika Labs",
    description: "Plataforma de generación de video que permite dar vida a tus ideas a través de animaciones fluidas y realistas.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://pika.art",
    imageUrl: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800",
    features: ["Animación de imagen", "Control de cámara", "Sincronización de labios"]
  },
  {
    id: "writesonic",
    name: "Writesonic",
    description: "Plataforma de IA para SEO, redacción de artículos y creación de chatbots personalizados para empresas.",
    category: "Generación de Texto",
    pricing: "Freemium",
    url: "https://writesonic.com",
    imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800",
    features: ["Escritura SEO", "Chatsonic", "Generador de landing pages"]
  },
  {
    id: "quillbot",
    name: "Quillbot",
    description: "Herramienta de parafraseo y resumen que ayuda a los estudiantes y profesionales a reescribir sus textos.",
    category: "Generación de Texto",
    pricing: "Freemium",
    url: "https://quillbot.com",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    features: ["Parafraseo", "Resumen", "Verificador de plagio"]
  },
  {
    id: "descript",
    name: "Descript",
    description: "Editor de video y audio basado en texto que permite editar clips simplemente editando la transcripción.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://www.descript.com",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800",
    features: ["Edición por texto", "Overdub (clonación de voz)", "Eliminación de muletillas"]
  },
  {
    id: "synthesia",
    name: "Synthesia",
    description: "Crea videos profesionales con avatares de IA en más de 120 idiomas sin necesidad de cámaras ni micrófonos.",
    category: "Video y Audio",
    pricing: "Pago",
    url: "https://www.synthesia.io",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    features: ["Avatares personalizados", "Multi-idioma", "Plantillas de video"]
  },
  {
    id: "otter",
    name: "Otter.ai",
    description: "Asistente de reuniones que transcribe conversaciones en tiempo real y genera resúmenes automáticos.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://otter.ai",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
    features: ["Transcripción en vivo", "Resumen de reuniones", "Integración con Zoom/Meet"]
  },
  {
    id: "tome",
    name: "Tome",
    description: "Formato de narración generativa para crear presentaciones interactivas y narrativas visuales con IA.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://tome.app",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    features: ["Narrativa fluida", "Generación de imágenes", "Diseño adaptativo"]
  },
  {
    id: "framer-ai",
    name: "Framer AI",
    description: "Diseña y publica sitios web completos a partir de una descripción de texto en cuestión de minutos.",
    category: "Productividad",
    pricing: "Freemium",
    url: "https://www.framer.com/ai",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800",
    features: ["Texto a sitio web", "Diseño interactivo", "Optimización SEO"]
  },
  {
    id: "tabnine",
    name: "Tabnine",
    description: "Asistente de código con IA que aprende de tu estilo para proporcionar autocompletado privado y seguro.",
    category: "Programación",
    pricing: "Freemium",
    url: "https://www.tabnine.com",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
    features: ["IA privada", "Soporte para IDEs", "Aprendizaje local"]
  },
  {
    id: "murf",
    name: "Murf AI",
    description: "Generador de voz de IA versátil que permite crear locuciones de calidad de estudio para videos y presentaciones.",
    category: "Video y Audio",
    pricing: "Freemium",
    url: "https://murf.ai",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800",
    features: ["Voces profesionales", "Sincronización de tiempo", "Editor de audio"]
  }
];

export async function searchTools(query: string): Promise<AITool[]> {
  if (!query) return AI_TOOLS;
  
  const lowerQuery = query.toLowerCase();
  return AI_TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.category.toLowerCase().includes(lowerQuery)
  );
}

export async function getToolsByCategory(category: string): Promise<AITool[]> {
  return AI_TOOLS.filter(tool => tool.category === category);
}
