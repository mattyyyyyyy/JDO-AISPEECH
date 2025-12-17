import React, { useState, useEffect, useRef } from 'react';
import { translateCategory, CATEGORY_MAP } from '../constants';
import { Search, Play, Pause, Heart, Globe, Mic, Filter, ArrowRight, MoreVertical, Check, X, Tag, RotateCcw } from 'lucide-react';
import { Page, Voice } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { useVoices } from '../contexts/VoiceContext';
import { useTTS } from '../contexts/TTSContext';

interface VoiceLibraryProps {
  onNavigate: (page: Page) => void;
  initialTab?: Page;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ onNavigate, initialTab = Page.PRESET }) => {
  const [activeTab, setActiveTab] = useState<Page>(initialTab);
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  const { voices, toggleFavorite } = useVoices();
  const { setSelectedVoice, selectedVoice } = useTTS(); // Used for "Select" action

  // Filter States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Categorized Filters
  const [genderFilter, setGenderFilter] = useState<string | null>(null); // 'Male' | 'Female'
  const [langFilter, setLangFilter] = useState<string | null>(null);     // 'Chinese' | 'English'
  const [catFilter, setCatFilter] = useState<string | null>(null);       // Category key
  const [tagFilters, setTagFilters] = useState<string[]>([]);            // Array of tags

  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Derive unique options
  const allTags: string[] = Array.from(new Set(voices.flatMap(v => v.tags)));
  const allCategories = Object.keys(CATEGORY_MAP);

  // Sync prop change
  useEffect(() => {
     setActiveTab(initialTab);
  }, [initialTab]);

  // Handle outside click for filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilterPanel(false);
      }
    };
    if (showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPanel]);


  const getFilteredVoices = () => {
    let filtered = voices;
    
    // 1. Tab Filtering
    switch (activeTab) {
        case Page.CUSTOM: filtered = filtered.filter(v => v.source === 'custom' || v.isCustom); break;
        case Page.FAVORITES: filtered = filtered.filter(v => v.isFavorite); break;
        case Page.PRESET: filtered = filtered.filter(v => v.source === 'preset'); break;
        case Page.DISCOVER: filtered = filtered.filter(v => v.source === 'community'); break;
        default: filtered = filtered.filter(v => v.source === 'community'); break;
    }

    // 2. Categorized Filtering
    if (genderFilter) {
      filtered = filtered.filter(v => v.gender === genderFilter);
    }
    if (langFilter) {
      filtered = filtered.filter(v => v.language === langFilter);
    }
    if (catFilter) {
      filtered = filtered.filter(v => v.category === catFilter);
    }
    if (tagFilters.length > 0) {
      filtered = filtered.filter(v => tagFilters.some(filter => v.tags.includes(filter)));
    }

    return filtered;
  };

  const filteredVoices = getFilteredVoices();

  const getTitle = () => {
     switch(activeTab) {
         case Page.FAVORITES: return '我的收藏';
         case Page.CUSTOM: return '自定义声音';
         default: return '发现声音';
     }
  };

  const toggleTagFilter = (tag: string) => {
    setTagFilters(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setGenderFilter(null);
    setLangFilter(null);
    setCatFilter(null);
    setTagFilters([]);
  };

  const activeFilterCount = (genderFilter ? 1 : 0) + (langFilter ? 1 : 0) + (catFilter ? 1 : 0) + tagFilters.length;

  const translateLang = (lang: string) => lang === 'Chinese' ? '中文' : '英文';

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-500">
       {/* Header with Reduced Height (Approx 30px content area + padding) */}
       <div className="flex justify-between items-center shrink-0 py-1 mb-4 border-b border-white/5 min-h-[30px]">
          <div className="flex items-center gap-6">
             <h1 className="text-lg font-bold text-white">
               {getTitle()}
             </h1>
             
             {/* Tabs */}
             {(activeTab === Page.DISCOVER || activeTab === Page.PRESET || activeTab === Page.CUSTOM) && (
               <div className="flex bg-[#161618] border border-white/5 rounded-lg p-0.5">
                  {[
                     {id: Page.DISCOVER, label: '发现声音'},
                     {id: Page.PRESET, label: '预设声音'},
                     {id: Page.CUSTOM, label: '自定义声音'},
                  ].map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => onNavigate(tab.id as Page)}
                     className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                   >
                     {tab.label}
                   </button>
                 ))}
               </div>
             )}
          </div>
          
          {/* Close button removed as requested */}
       </div>

       {/* Toolbar */}
       <div className="flex gap-3 shrink-0 mb-4 relative z-20">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-2.5 text-white/50" size={16} />
             <input className="w-full bg-[#161618] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-spark-accent/50 outline-none transition-colors placeholder-white/20" placeholder="搜索声音..." />
          </div>
          
          <div className="flex gap-2 relative">
             <button 
               onClick={(e) => { e.stopPropagation(); setShowFilterPanel(!showFilterPanel); }}
               className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${showFilterPanel || activeFilterCount > 0 ? 'bg-spark-accent/20 border-spark-accent/50 text-white' : 'bg-[#161618] border-white/5 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20'}`}
             >
                <Filter size={14} /> 筛选 {activeFilterCount > 0 && `(${activeFilterCount})`}
             </button>

             {/* Categorized Filter Panel */}
             {showFilterPanel && (
                <div ref={filterPanelRef} className="absolute top-full right-0 mt-2 w-[400px] bg-[#161618] border border-white/10 rounded-xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-5">
                   
                   <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-sm font-bold text-white">筛选条件</span>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-spark-accent hover:underline flex items-center gap-1">
                          <RotateCcw size={10} /> 重置
                        </button>
                      )}
                   </div>

                   {/* Gender */}
                   <div>
                      <div className="text-xs font-bold text-white/40 uppercase mb-2">性别</div>
                      <div className="flex gap-2">
                         {['Male', 'Female'].map(g => (
                            <button
                              key={g}
                              onClick={() => setGenderFilter(genderFilter === g ? null : g)}
                              className={`px-3 py-1.5 rounded text-xs border transition-all ${genderFilter === g ? 'bg-spark-accent text-white border-spark-accent' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}
                            >
                               {g === 'Male' ? '男性' : '女性'}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Language */}
                   <div>
                      <div className="text-xs font-bold text-white/40 uppercase mb-2">语言</div>
                      <div className="flex gap-2">
                         {['Chinese', 'English'].map(l => (
                            <button
                              key={l}
                              onClick={() => setLangFilter(langFilter === l ? null : l)}
                              className={`px-3 py-1.5 rounded text-xs border transition-all ${langFilter === l ? 'bg-spark-accent text-white border-spark-accent' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}
                            >
                               {l === 'Chinese' ? '中文' : '英文'}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Category (Role) */}
                   <div>
                      <div className="text-xs font-bold text-white/40 uppercase mb-2">角色</div>
                      <div className="flex flex-wrap gap-2">
                         {allCategories.map((cat: string) => (
                            <button
                              key={cat}
                              onClick={() => setCatFilter(catFilter === cat ? null : cat)}
                              className={`px-3 py-1.5 rounded text-xs border transition-all ${catFilter === cat ? 'bg-spark-accent text-white border-spark-accent' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}
                            >
                               {translateCategory(cat)}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Tags (Emotion) */}
                   <div>
                      <div className="text-xs font-bold text-white/40 uppercase mb-2">情绪 / 风格</div>
                      <div className="flex flex-wrap gap-2">
                         {allTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => toggleTagFilter(tag)}
                              className={`px-3 py-1.5 rounded text-xs border transition-all ${tagFilters.includes(tag) ? 'bg-spark-accent text-white border-spark-accent' : 'bg-white/5 text-white/60 border-white/5 hover:text-white'}`}
                            >
                               {tag}
                            </button>
                         ))}
                      </div>
                   </div>

                </div>
             )}
          </div>
       </div>

       {/* List (Slim Style) */}
       <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar">
          {activeTab === Page.CUSTOM && (
            <div 
              onClick={() => onNavigate(Page.VOICE_CLONING)}
              className="w-full h-16 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] hover:border-spark-accent/50 cursor-pointer transition-all mb-3 group"
            >
               <Mic className="text-white/40 group-hover:text-spark-accent transition-colors" size={20} />
               <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">创建新声音 (Voice Clone)</span>
            </div>
          )}

          <div className="space-y-2">
            {filteredVoices.map(voice => {
              const isCurrent = currentVoice?.id === voice.id;
              const playing = isCurrent && isPlaying;
              const isSelected = selectedVoice.id === voice.id;
              
              return (
                <div 
                  key={voice.id} 
                  className={`
                    group flex items-center p-4 rounded-xl transition-all border
                    ${playing ? 'bg-[#1a1a1c] border-spark-accent/30' : 'bg-[#1a1a1c]/60 border-transparent hover:bg-[#202022] hover:border-white/5'}
                  `}
                >
                   {/* Avatar & Play */}
                   <div 
                     className="relative cursor-pointer shrink-0"
                     onClick={(e) => {
                       e.stopPropagation();
                       playVoice(voice);
                     }}
                   >
                       <img src={voice.avatarUrl} alt={voice.name} className="w-14 h-14 rounded-lg object-cover bg-black/20" />
                       <div className={`
                         absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all
                         ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                       `}>
                          {playing ? <Pause size={20} fill="white" className="text-white" /> : <Play size={20} fill="white" className="text-white ml-0.5" />}
                       </div>
                   </div>

                   {/* Info */}
                   <div className="flex-1 ml-5 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1.5">
                         <h3 className={`text-base font-bold truncate ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                         {isSelected && <span className="text-xs bg-spark-accent/20 text-spark-accent px-1.5 py-0.5 rounded font-bold">已选</span>}
                         
                         {/* Distinct Gender Badge (Slightly larger text) */}
                         <span className={`text-xs px-2 py-0.5 rounded font-bold flex items-center ${voice.gender === 'Male' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                           {voice.gender === 'Male' ? '男' : '女'}
                         </span>
                      </div>
                      <p className="text-sm text-white/50 truncate pr-4">
                         {voice.description || `一句话描述该声音的特点，例如：${translateCategory(voice.category)}，${translateLang(voice.language)}。`}
                      </p>
                   </div>

                   {/* Tags (Increased text size) */}
                   <div className="hidden xl:flex items-center gap-2 mr-6">
                      <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-xs text-white/60">{translateLang(voice.language)}</span>
                      <span className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-xs text-white/60">{translateCategory(voice.category)}</span>
                      {voice.tags.slice(0, 1).map(t => (
                        <span key={t} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-xs text-white/60">{t}</span>
                      ))}
                   </div>

                   {/* Actions */}
                   <div className="flex items-center gap-3">
                      <button 
                         onClick={() => {
                           setSelectedVoice(voice);
                           if (onNavigate) onNavigate(Page.TTS);
                         }}
                         className={`
                            px-5 py-2 rounded-full text-xs font-bold transition-all border
                            ${isSelected 
                               ? 'bg-spark-accent text-white border-spark-accent shadow-lg shadow-spark-accent/20' 
                               : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'}
                         `}
                      >
                         {isSelected ? '已选' : '选择'}
                      </button>

                      <button
                         onClick={(e) => { e.stopPropagation(); toggleFavorite(voice.id); }}
                         className={`p-2.5 rounded-lg transition-colors ${voice.isFavorite ? 'text-red-500' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                      >
                         <Heart size={20} fill={voice.isFavorite ? "currentColor" : "none"} />
                      </button>
                   </div>
                </div>
              );
            })}
            
            {filteredVoices.length === 0 && (
               <div className="py-20 flex flex-col items-center justify-center text-white/20">
                  <Globe size={48} className="mb-4 opacity-50" />
                  <p>没有找到相关声音</p>
                  {activeFilterCount > 0 && <button onClick={clearFilters} className="text-sm text-spark-accent mt-2 hover:underline">清除筛选</button>}
               </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default VoiceLibrary;