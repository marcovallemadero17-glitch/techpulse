import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Apple, 
  Code, 
  BrainCircuit, 
  Globe, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  ChevronRight,
  Newspaper,
  Menu,
  X,
  ArrowLeft,
  Share2,
  Bell
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { fetchTechNews, fetchNewsDetail, NewsItem } from "./services/newsService";
import LegalModal from "./components/LegalModals";

const CATEGORIES = [
  { id: "General", name: "General", icon: Globe, color: "text-blue-600" },
  { id: "Apple", name: "Apple", icon: Apple, color: "text-slate-800" },
  { id: "Software", name: "Software", icon: Code, color: "text-emerald-600" },
  { id: "Hardware", name: "Componentes", icon: Cpu, color: "text-orange-600" },
  { id: "IA", name: "Inteligencia Artificial", icon: BrainCircuit, color: "text-indigo-600" },
];

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutos
const CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hora

export default function App() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: "privacy" | "terms" | "cookies" | "contact" }>({
    isOpen: false,
    type: "privacy"
  });
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const newsRef = useRef<NewsItem[]>([]);

  // Sincronizar ref con estado
  useEffect(() => {
    newsRef.current = news;
  }, [news]);

  // Cargar desde cache inicial
  useEffect(() => {
    const cached = localStorage.getItem(`news_${activeCategory}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setNews(parsed.items);
        setLastUpdated(parsed.time);
        setLoading(false);
      } catch (e) {
        console.error("Error parsing cache", e);
      }
    }
  }, [activeCategory]);

  const loadNews = useCallback(async (category: string, isBackground = false, force = false) => {
    // Si no es forzado y no es background, revisar si el cache es suficientemente reciente
    if (!force && !isBackground) {
      const cached = localStorage.getItem(`news_${category}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const now = Date.now();
          // Si el cache tiene menos de 30 minutos, no re-descargar al cambiar de pestaña
          if (parsed.timestamp && (now - parsed.timestamp < REFRESH_INTERVAL)) {
            return;
          }
        } catch (e) {
          // Ignorar error de parseo y descargar
        }
      }
    }

    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const data = await fetchTechNews(category);
      
      // Si recibimos exactamente las noticias estáticas de fallback, mostrar aviso
      const isStaticFallback = data.length > 0 && data[0].id.startsWith("fallback-");
      
      if (isBackground) {
        const currentNews = newsRef.current;
        if (data.length > 0 && currentNews.length > 0 && data[0].id !== currentNews[0].id) {
          setHasNewUpdates(true);
        }
      } else {
        setNews(data);
        const time = new Date().toLocaleTimeString();
        setLastUpdated(time);
        localStorage.setItem(`news_${category}`, JSON.stringify({ 
          items: data, 
          time,
          timestamp: Date.now() 
        }));
        setHasNewUpdates(false);
      }
    } catch (err: any) {
      console.error(err);
      // Silent fallback is handled by newsService returning static data
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []); // Sin dependencia de news para evitar loop

  // Efecto para carga inicial y cambio de categoría
  useEffect(() => {
    loadNews(activeCategory);
    
    // Configurar refresco automático
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(() => {
      loadNews(activeCategory, true);
    }, REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [activeCategory, loadNews]);

  const handleSelectNews = async (item: NewsItem) => {
    setSelectedNews(item);
    if (!item.fullContent) {
      setLoadingDetail(true);
      try {
        const detail = await fetchNewsDetail(item);
        const updatedItem = { ...item, fullContent: detail };
        setSelectedNews(updatedItem);
        // Actualizar en la lista principal para cachear el detalle
        setNews(prev => prev.map(n => n.id === item.id ? updatedItem : n));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">CeroBit</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:h-screen
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}>
          <div className="p-8 h-full flex flex-col">
            <div className="hidden lg:flex items-center gap-3.5 mb-14">
              <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/10">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">CeroBit</span>
            </div>

            <nav className="space-y-1.5 flex-grow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-7 px-4">Explorar</p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsSidebarOpen(false);
                    setHasNewUpdates(false);
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative
                    ${activeCategory === cat.id 
                      ? "bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/10" 
                      : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"}
                  `}
                >
                  <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? "text-blue-400" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span className="text-sm tracking-tight">{cat.name}</span>
                  {activeCategory === cat.id && (
                    <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tecnología</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <BrainCircuit className="w-4 h-4 text-slate-900" />
                  </div>
                  <p className="font-bold text-xs text-slate-700 tracking-tight">
                    Gemini AI Engine
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow h-screen overflow-y-auto bg-[#F8F9FA] scroll-smooth">
          <div className="max-w-6xl mx-auto p-6 lg:p-16">
            <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-blue-600 font-black">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                  <span className="text-[10px] uppercase tracking-[0.3em]">En Vivo • Actualizado</span>
                </div>
                <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                  {CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h1>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {lastUpdated && (
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Última actualización</span>
                    <span className="text-xs font-bold text-slate-600">{lastUpdated}</span>
                  </div>
                )}
                <button 
                  onClick={() => loadNews(activeCategory, false, true)}
                  disabled={loading}
                  className="flex items-center gap-2.5 px-8 py-4 bg-white border border-slate-200/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 disabled:opacity-50 shadow-sm active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refrescar
                </button>
              </div>
            </header>

            {/* Background Update Notification */}
            <AnimatePresence>
              {hasNewUpdates && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/20"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium tracking-tight">Nuevas noticias disponibles</span>
                  </div>
                  <button 
                    onClick={() => loadNews(activeCategory, false, true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >
                    Actualizar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading && news.length === 0 ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 animate-pulse shadow-sm">
                      <div className="h-52 bg-slate-50 rounded-3xl mb-6" />
                      <div className="h-7 bg-slate-50 rounded-lg w-3/4 mb-4" />
                      <div className="h-4 bg-slate-50 rounded-lg w-full mb-2" />
                      <div className="h-4 bg-slate-50 rounded-lg w-5/6 mb-6" />
                      <div className="flex justify-between items-center mt-auto">
                        <div className="h-4 bg-slate-50 rounded-lg w-24" />
                        <div className="h-8 w-8 bg-slate-50 rounded-full" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : error && news.length === 0 ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-16 text-center"
                >
                  <div className="w-16 h-16 bg-white border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <p className="text-slate-900 font-bold text-xl mb-2">Estamos actualizando el contenido</p>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Vuelve a intentarlo en unos momentos o refresca la página.</p>
                  <button 
                    onClick={() => loadNews(activeCategory, false, true)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Reintentar
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {news.map((item, idx) => (
                    <motion.article 
                      key={item.id || idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      onClick={() => handleSelectNews(item)}
                      className="group cursor-pointer bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col relative"
                    >
                      <div className="relative h-64 overflow-hidden">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-slate-200" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-xl text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-sm border border-white/20">
                            {item.source}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-9 flex flex-col flex-grow">
                        <div className="flex items-center gap-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-5">
                          <Clock className="w-3.5 h-3.5" />
                          {item.date}
                        </div>

                        <h3 className="text-2xl font-black leading-[1.15] mb-5 text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                          {item.title}
                        </h3>

                        <div className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 font-medium">
                          {item.summary}
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                            Leer artículo
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                          </span>
                          <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 group-hover:rotate-[-10deg]">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {news.length === 0 && !loading && !error && (
              <div className="text-center py-32">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-medium">No hay noticias disponibles en este momento.</p>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-24 pt-12 border-t border-slate-100 pb-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-slate-400">CeroBit News</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8">
                  <button onClick={() => setLegalModal({ isOpen: true, type: "privacy" })} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Privacidad</button>
                  <button onClick={() => setLegalModal({ isOpen: true, type: "terms" })} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Términos</button>
                  <button onClick={() => setLegalModal({ isOpen: true, type: "cookies" })} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Cookies</button>
                  <button onClick={() => setLegalModal({ isOpen: true, type: "contact" })} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Contacto</button>
                </div>

                <p className="text-xs text-slate-400 font-medium">© 2026 CeroBit News. Todos los derechos reservados.</p>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setSelectedNews(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-6 right-6 z-10 flex gap-3">
                <button 
                  onClick={() => window.open(selectedNews.url, '_blank')}
                  className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-all text-slate-900"
                  title="Ver fuente original"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-slate-100 transition-all text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto">
                <div className="h-[40vh] relative">
                  {selectedNews.imageUrl ? (
                    <img 
                      src={selectedNews.imageUrl} 
                      alt={selectedNews.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Newspaper className="w-20 h-20 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>

                <div className="px-8 md:px-16 pb-16 -mt-32 relative">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-600/20">
                      {selectedNews.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedNews.date}
                    </span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 mb-8">
                    {selectedNews.title}
                  </h2>

                  {loadingDetail ? (
                    <div className="space-y-6 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-5/6" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                      <div className="h-4 bg-slate-100 rounded w-4/6" />
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed prose-a:text-blue-600">
                      <ReactMarkdown>{selectedNews.fullContent || selectedNews.summary}</ReactMarkdown>
                    </div>
                  )}

                  {!loadingDetail && (
                    <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compartir</p>
                          <p className="text-sm font-bold text-slate-900">Difunde la noticia</p>
                        </div>
                      </div>
                      
                      <a 
                        href={selectedNews.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                      >
                        Ver en {selectedNews.source}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
        type={legalModal.type} 
      />
    </div>
  );
}
