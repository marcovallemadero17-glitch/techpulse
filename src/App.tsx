import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Cpu, 
  ExternalLink, 
  Info, 
  ShieldCheck, 
  FileText, 
  Mail, 
  ChevronRight, 
  Sparkles,
  Layers,
  Zap,
  Code,
  Video,
  Image as ImageIcon,
  Type,
  Layout,
  X,
  Menu,
  Share2,
  Heart,
  Check,
  TrendingUp,
  Star
} from "lucide-react";
import { AI_TOOLS, AITool, searchTools } from "./services/aiService";
import { LEGAL_CONTENT } from "./constants/legal";

const CATEGORIES = [
  "Todos",
  "Generación de Texto",
  "Generación de Imágenes",
  "Video y Audio",
  "Programación",
  "Productividad"
];

export default function App() {
  const [tools, setTools] = useState<AITool[]>(AI_TOOLS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [legalPage, setLegalPage] = useState<keyof typeof LEGAL_CONTENT | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("aibit_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [showToast, setShowToast] = useState(false);
  const [toolOfTheDay, setToolOfTheDay] = useState<AITool | null>(null);

  useEffect(() => {
    // Select a random tool of the day
    const randomTool = AI_TOOLS[Math.floor(Math.random() * AI_TOOLS.length)];
    setToolOfTheDay(randomTool);
  }, []);

  useEffect(() => {
    localStorage.setItem("aibit_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const filterTools = async () => {
      let filtered = await searchTools(searchQuery);
      if (activeCategory === "Favoritos") {
        filtered = filtered.filter(t => favorites.includes(t.id));
      } else if (activeCategory !== "Todos") {
        filtered = filtered.filter(t => t.category === activeCategory);
      }
      setTools(filtered);
    };
    filterTools();
  }, [searchQuery, activeCategory, favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Generación de Texto": return <Type className="w-4 h-4" />;
      case "Generación de Imágenes": return <ImageIcon className="w-4 h-4" />;
      case "Video y Audio": return <Video className="w-4 h-4" />;
      case "Programación": return <Code className="w-4 h-4" />;
      case "Productividad": return <Zap className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveCategory("Todos"); setLegalPage(null); }}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">AIBit</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => setLegalPage(null)} className="text-sm font-medium hover:text-blue-400 transition-colors">Directorio</button>
              <button onClick={() => setLegalPage("about")} className="text-sm font-medium hover:text-blue-400 transition-colors">Sobre Nosotros</button>
              <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-400 hover:text-white">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-end mb-12">
                <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setLegalPage(null); setIsMenuOpen(false); }} 
                  className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                      <Layout className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">Directorio</div>
                      <div className="text-slate-500 text-sm">Explora todas las IAs</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-600" />
                </button>

                <button 
                  onClick={() => { setLegalPage("about"); setIsMenuOpen(false); }} 
                  className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">Sobre Nosotros</div>
                      <div className="text-slate-500 text-sm">Nuestra misión</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-600" />
                </button>

                <button 
                  onClick={() => { handleShare(); setIsMenuOpen(false); }} 
                  className="flex items-center justify-between p-6 bg-blue-600 rounded-[2rem] text-left group shadow-xl shadow-blue-600/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">Compartir</div>
                      <div className="text-blue-100 text-sm">Invita a tus amigos</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-blue-200" />
                </button>
              </div>

              <div className="mt-auto pb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-black tracking-tighter text-white">AIBit</span>
                </div>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">© 2024 AIBit</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {legalPage ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h1 className="text-4xl font-black text-white mb-8 tracking-tight">{LEGAL_CONTENT[legalPage].title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                {LEGAL_CONTENT[legalPage].content}
              </p>
            </div>
            <button 
              onClick={() => setLegalPage(null)}
              className="mt-12 flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Volver al Directorio
            </button>
          </motion.div>
        ) : (
          <>
            {/* Hero Section */}
            <header className="text-center mb-16 relative">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full -z-10" />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Directorio Curado 2024</span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1] md:leading-[0.85]">
                El Futuro es <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Inteligente</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-4">
                AIBit es el centro de recursos definitivo para encontrar las mejores herramientas de IA que potenciarán tu flujo de trabajo y creatividad.
              </p>
            </header>

            {/* Tool of the Day */}
            {toolOfTheDay && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTool(toolOfTheDay)}
                className="mb-16 relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 md:p-6">
                    <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/40">
                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                      Herramienta del Día
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                    <img src={toolOfTheDay.imageUrl} alt={toolOfTheDay.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2 md:mb-4 block">{toolOfTheDay.category}</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight leading-tight">{toolOfTheDay.name}</h2>
                    <p className="text-slate-400 text-sm md:text-lg mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed">{toolOfTheDay.description}</p>
                    <button className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-xl md:rounded-2xl font-black hover:bg-blue-400 hover:text-white transition-all flex items-center justify-center gap-3">
                      Explorar Ahora
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search & Categories */}
            <div className="mb-12 space-y-8">
              <div className="relative max-w-2xl mx-auto group px-2">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Busca herramientas, categorías o funciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 md:py-6 pl-16 pr-6 text-white text-base md:text-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-2xl"
                />
              </div>

              <div className="relative">
                <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-wrap md:justify-center gap-3 no-scrollbar px-4 md:px-0 scroll-smooth">
                  {["Todos", "Favoritos", ...CATEGORIES.slice(1)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                        activeCategory === cat 
                          ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/30 scale-105" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {cat === "Favoritos" ? <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} /> : getCategoryIcon(cat)}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {tools.map((tool, idx) => (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedTool(tool)}
                    className="group bg-white/5 rounded-3xl border border-white/5 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img 
                        src={tool.imageUrl} 
                        alt={tool.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3">
                        {idx % 3 === 0 && (
                          <div className="px-2 py-1 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </div>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button 
                          onClick={(e) => toggleFavorite(e, tool.id)}
                          className="p-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(tool.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{tool.pricing}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2 font-medium leading-relaxed mb-6">
                        {tool.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span className="text-[10px] font-black uppercase tracking-widest">Ver Detalles</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {tools.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No se encontraron herramientas</h3>
                <p className="text-slate-500">Intenta con otros términos de búsqueda o categorías.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">AIBit</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                El directorio líder en herramientas de inteligencia artificial. Ayudamos a conectar a las personas con la tecnología del futuro.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><button onClick={() => setLegalPage("privacy")} className="hover:text-blue-400 transition-colors">Privacidad</button></li>
                <li><button onClick={() => setLegalPage("terms")} className="hover:text-blue-400 transition-colors">Términos</button></li>
                <li><button onClick={() => setLegalPage("cookies")} className="hover:text-blue-400 transition-colors">Cookies</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Contacto</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  marcovallemadero17@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Soporte 24/7
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © 2024 AIBit. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-blue-600/40"
          >
            <Check className="w-5 h-5" />
            ¡Enlace Copiado al Portapapeles!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool Modal */}
      <AnimatePresence>
        {selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTool(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0f0f0f] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedTool(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden no-scrollbar">
                <div className="lg:w-1/2 h-48 sm:h-64 lg:h-auto relative flex-shrink-0">
                  <img 
                    src={selectedTool.imageUrl} 
                    alt={selectedTool.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0f0f0f]" />
                </div>

                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                        {selectedTool.category}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {selectedTool.pricing}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => toggleFavorite(e, selectedTool.id)}
                      className={`p-3 rounded-2xl border transition-all ${
                        favorites.includes(selectedTool.id) 
                          ? "bg-red-500/10 border-red-500/50 text-red-500" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedTool.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{selectedTool.name}</h2>
                  <p className="text-slate-400 text-base sm:text-xl leading-relaxed mb-10 font-medium">
                    {selectedTool.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Popularidad</div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Alta
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Valoración</div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        4.9/5
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 mb-12">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      Características Principales
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedTool.features.map((feature, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 text-base font-bold text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                    <a 
                      href={selectedTool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-center transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 group"
                    >
                      Visitar Sitio Oficial
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                    <button 
                      onClick={handleShare}
                      className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all border border-white/10 flex items-center justify-center gap-3"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
