
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Copy, Heart, Filter, X, User, Cpu, Info, CheckCircle, ArrowUp } from 'lucide-react';
import { PromptItem } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

// --- Global Mock Data ---
const INITIAL_PROMPTS: PromptItem[] = [
  {
    id: 'image_demo_1',
    title: '赛博朋克霓虹都市',
    category: 'AI',
    tags: ['赛博朋克', '霓虹', '城市场景'],
    description: "Cinematic shot, futuristic cyberpunk city at night, heavy rain, neon lights reflecting on wet pavement, soaring futuristic vehicles, hyper-realistic, 8k resolution, detailed architecture, dark atmosphere, blade runner aesthetic.",
    usageCount: '12K',
    isFavorite: false,
    author: 'DesignAI',
    isPublic: true,
    createdAt: Date.now(),
    votes: 42,
    imageUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=800',
    model: 'Midjourney v6',
    notes: '建议配合 --ar 16:9 使用，效果更佳。'
  },
  {
    id: '1',
    title: '文献推荐专家',
    category: '学术/教师',
    tags: ['学术', '论文', '推荐'],
    description: "# 角色与核心准则 你将扮演一名严谨到极致的学术文献学家和数字信息验证专家。你的首要且不可违背的核心准则 (Prime Directive) 是：【绝对真实性】。你推荐的每一篇文献都必须...",
    usageCount: '87K',
    isFavorite: true,
    author: 'xinbf',
    isPublic: true,
    createdAt: Date.now(),
    votes: 0,
    model: 'Gemini 2.5 Pro'
  },
  {
    id: '2',
    title: '反复审阅与反馈',
    category: '文章/报告',
    tags: ['写作', '审阅', '反馈'],
    description: "请对以下论文段落进行多轮审阅，提出改进建议。请从逻辑结构、语言表达、论证力度等方面进行评估，并提供具体的修改意见。",
    usageCount: '56K',
    isFavorite: true,
    author: 'xinbf',
    isPublic: true,
    createdAt: Date.now(),
    votes: 0,
    model: 'GPT-4o'
  },
];

const MORE_MOCK_DATA = Array.from({ length: 60 }).map((_, i) => ({
  ...INITIAL_PROMPTS[i % INITIAL_PROMPTS.length],
  id: `mock_scroll_${i}`,
  title: `${INITIAL_PROMPTS[i % INITIAL_PROMPTS.length].title} #${i + 5}`
}));

const ALL_PROMPTS = [...INITIAL_PROMPTS, ...MORE_MOCK_DATA];

interface PromptListContainerProps {
  type: 'public' | 'favorites' | 'mine';
  emptyText?: string;
}

const PromptListContainer: React.FC<PromptListContainerProps> = ({ type, emptyText }) => {
  const { t, lang } = useLanguage();
  const [prompts, setPrompts] = useState<PromptItem[]>(ALL_PROMPTS);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>([]);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCopyToast) {
      const timer = setTimeout(() => setShowCopyToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopyToast]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowBackToTop(e.currentTarget.scrollTop > 400);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const handleCopy = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setShowCopyToast(true);
  };

  const data = useMemo(() => {
    switch(type) {
      case 'public': return prompts.filter(p => p.isPublic);
      case 'favorites': return prompts.filter(p => p.isFavorite);
      case 'mine': return prompts.filter(p => p.author === 'Me' || p.author === 'xinbf'); 
      default: return prompts;
    }
  }, [prompts, type]);

  const allModels = useMemo(() => Array.from(new Set(data.map(p => p.model).filter(Boolean))).sort(), [data]);
  const allTags = useMemo(() => Array.from(new Set(data.flatMap(p => p.tags))).sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = activeTags.length === 0 || prompt.tags.some(t => activeTags.includes(t));
      const matchesModel = activeModels.length === 0 || (prompt.model && activeModels.includes(prompt.model));
      return matchesSearch && matchesTags && matchesModel;
    });
  }, [data, searchQuery, activeTags, activeModels]);

  const activeFilterCount = activeTags.length + activeModels.length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 mb-8 shrink-0 relative z-20 items-center">
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-5 py-3 rounded-xl border text-base font-bold transition-all flex items-center gap-3 ${isFilterOpen || activeFilterCount > 0 ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-[#161618] border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`}
          >
            <Filter size={18} />
            筛选 {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-3 w-96 bg-[#161618] border border-white/10 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-6">
              <div>
                <div className="text-xs font-black text-white/40 uppercase mb-4 tracking-widest">{t('prompt_filter_models')}</div>
                <div className="flex flex-wrap gap-2.5">
                  {allModels.map(m => (
                    <button key={m} onClick={() => setActiveModels(prev => prev.includes(m!) ? prev.filter(x => x !== m) : [...prev, m!])} className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${activeModels.includes(m!) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-md' : 'bg-white/5 border-transparent text-white/40 hover:text-white'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black text-white/40 uppercase mb-4 tracking-widest">{t('prompt_filter_tags')}</div>
                <div className="flex flex-wrap gap-2.5">
                  {allTags.map(t => (
                    <button key={t} onClick={() => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${activeTags.includes(t) ? 'bg-spark-accent/20 border-spark-accent text-white shadow-md' : 'bg-white/5 border-transparent text-white/40 hover:text-white'}`}>#{t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-white/30" size={20} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161618] border border-white/10 rounded-xl py-3.5 pl-14 pr-12 text-white text-base focus:border-indigo-500 outline-none placeholder-white/20 transition-all shadow-lg" 
            placeholder={t('prompt_search_placeholder')} 
          />
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20"
      >
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredData.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedPrompt(item)}
                className="group bg-[#1a1a1c] border border-white/5 hover:border-indigo-500/50 rounded-[2rem] p-6 transition-all duration-300 hover:bg-[#202022] hover:shadow-2xl flex flex-col h-[400px] cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 truncate transition-colors pr-2 leading-tight">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-black uppercase tracking-wider shrink-0 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <User size={14} /> {item.author === 'Me' ? (lang === 'CN' ? '我' : 'Me') : item.author}
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden rounded-2xl bg-black/20 border border-white/5 mb-5 group-hover:border-white/10 transition-colors">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                  ) : (
                    <div className="p-6">
                      <p className="text-base text-white/50 leading-relaxed line-clamp-6 font-light">{item.description}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1c]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5 shrink-0">
                  <div className="flex gap-2 overflow-hidden flex-1 mr-4">
                    {item.model && <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-black uppercase tracking-widest truncate">{item.model}</span>}
                    <span className="px-3 py-1 rounded-lg bg-white/5 text-xs text-white/40 font-bold truncate">#{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => handleCopy(item.description, e)} className="p-2.5 text-white/30 hover:text-indigo-400 transition-all transform hover:scale-110"><Copy size={22}/></button>
                    <button onClick={(e) => toggleFavorite(item.id, e)} className={`p-2.5 transition-all transform hover:scale-110 ${item.isFavorite ? 'text-red-500' : 'text-white/30 hover:text-red-400'}`}><Heart size={22} fill={item.isFavorite ? "currentColor" : "none"}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-white/20">
            <Search size={64} className="mb-6 opacity-30" />
            <p className="text-xl font-medium">{emptyText || t('prompt_empty')}</p>
          </div>
        )}
      </div>

      {showBackToTop && (
        <button onClick={scrollToTop} className="fixed bottom-12 right-12 z-[100] p-5 rounded-2xl bg-indigo-600 text-white shadow-[0_15px_40px_rgba(79,70,229,0.4)] hover:scale-110 active:scale-95 transition-all border border-indigo-500"><ArrowUp size={28} /></button>
      )}

      {showCopyToast && createPortal(
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-8 py-3 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-indigo-500">
            <CheckCircle size={20}/> {t('prompt_copy_success')}
          </div>
        </div>, document.body
      )}

      {selectedPrompt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedPrompt(null)}></div>
          <div className={`relative w-full ${selectedPrompt.imageUrl ? 'max-w-6xl' : 'max-w-4xl'} bg-[#12141a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#161618]">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-white leading-tight">{selectedPrompt.title}</h2>
                <span className="text-xs font-black uppercase text-white/40 px-3 py-1 rounded-lg border border-white/10 tracking-widest">{selectedPrompt.category}</span>
              </div>
              <button onClick={() => setSelectedPrompt(null)} className="text-white/40 hover:text-white p-2.5 hover:bg-white/10 rounded-xl transition-all"><X size={32}/></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#0a0a0c]">
              <div className={`grid grid-cols-1 ${selectedPrompt.imageUrl ? 'lg:grid-cols-2' : ''} gap-12`}>
                {selectedPrompt.imageUrl && (
                  <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 h-fit shadow-2xl">
                    <img src={selectedPrompt.imageUrl} className="w-full h-auto" alt="preview" />
                  </div>
                )}
                <div className="space-y-8">
                  <div className="flex flex-wrap gap-3">
                    {selectedPrompt.model && <div className="flex items-center gap-2.5 text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-[0.15em]"><Cpu size={18}/> {selectedPrompt.model}</div>}
                    <div className="flex items-center gap-2.5 text-white/50 bg-white/5 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-[0.1em]"><User size={18}/> {selectedPrompt.author}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Prompt 内容</span>
                      <button onClick={() => handleCopy(selectedPrompt.description)} className="flex items-center gap-2 text-sm text-indigo-400 font-black hover:text-indigo-300 transition-all"><Copy size={16}/> {t('prompt_copy')}</button>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-base text-white/90 leading-relaxed font-mono whitespace-pre-wrap shadow-inner">{selectedPrompt.description}</div>
                  </div>
                  {selectedPrompt.notes && (
                    <div className="space-y-3 px-1">
                      <span className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2"><Info size={16}/> 使用建议</span>
                      <p className="text-base text-white/50 leading-relaxed font-light">{selectedPrompt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default PromptListContainer;
