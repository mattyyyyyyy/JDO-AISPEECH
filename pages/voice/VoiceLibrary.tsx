
import React, { useState, useEffect, useRef } from 'react';
import { translateCategory, CATEGORY_MAP } from '../../constants';
import { Search, Play, Pause, Heart, Globe, Mic, Filter, RotateCcw } from 'lucide-react';
import { Page } from '../../types';
import { usePlayer } from '../../contexts/PlayerContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useTTS } from '../../contexts/TTSContext';

interface VoiceLibraryProps {
  onNavigate: (page: Page) => void;
  initialTab?: Page;
}

const VoiceLibrary: React.FC<VoiceLibraryProps> = ({ onNavigate, initialTab = Page.PRESET }) => {
  const [activeTab, setActiveTab] = useState<Page>(initialTab);
  const { playVoice, currentVoice, isPlaying } = usePlayer();
  const { voices, toggleFavorite } = useVoices();
  const { setSelectedVoice, selectedVoice } = useTTS();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [langFilter, setLangFilter] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const allTags: string[] = Array.from(new Set(voices.flatMap(v => v.tags)));
  const allCategories = Object.keys(CATEGORY_MAP);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) setShowFilterPanel(false);
    };
    if (showFilterPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterPanel]);

  const getFilteredVoices = () => {
    let filtered = voices;
    switch (activeTab) {
        case Page.CUSTOM: filtered = filtered.filter(v => v.source === 'custom' || v.isCustom); break;
        case Page.FAVORITES: filtered = filtered.filter(v => v.isFavorite); break;
        case Page.PRESET: filtered = filtered.filter(v => v.source === 'preset'); break;
        case Page.DISCOVER: filtered = filtered.filter(v => v.source === 'community'); break;
        default: filtered = filtered.filter(v => v.source === 'community'); break;
    }
    if (genderFilter) filtered = filtered.filter(v => v.gender === genderFilter);
    if (langFilter) filtered = filtered.filter(v => v.language === langFilter);
    if (catFilter) filtered = filtered.filter(v => v.category === catFilter);
    if (tagFilters.length > 0) filtered = filtered.filter(v => tagFilters.some(f => v.tags.includes(f)));
    return filtered;
  };

  const clearFilters = () => { setGenderFilter(null); setLangFilter(null); setCatFilter(null); setTagFilters([]); };
  const translateLang = (lang: string) => lang === 'Chinese' ? '中文' : '英文';

  return (
    <div className="h-full flex flex-col gap-0 animate-in fade-in duration-500">
       <div className="flex justify-between items-center shrink-0 py-1 mb-4 border-b border-white/5 min-h-[30px]">
          <div className="flex items-center gap-6"><h1 className="text-lg font-bold text-white">{activeTab === Page.FAVORITES ? '我的收藏' : '发现声音'}</h1><div className="flex bg-[#161618] border border-white/5 rounded-lg p-0.5">{[{id: Page.DISCOVER, label: '发现声音'}, {id: Page.PRESET, label: '预设声音'}, {id: Page.CUSTOM, label: '自定义声音'}].map((tab) => <button key={tab.id} onClick={() => onNavigate(tab.id as Page)} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/10'}`}>{tab.label}</button>)}</div></div>
       </div>
       <div className="flex gap-3 shrink-0 mb-4 relative z-20"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-2.5 text-white/50" size={16} /><input className="w-full bg-[#161618] border border-white/5 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-spark-accent/50 outline-none placeholder-white/20" placeholder="搜索声音..." /></div><div className="flex gap-2 relative"><button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${showFilterPanel ? 'bg-spark-accent/20 border-spark-accent/50 text-white' : 'bg-[#161618] border-white/5 text-white/70'}`}><Filter size={14} /> 筛选</button>{showFilterPanel && <div ref={filterPanelRef} className="absolute top-full right-0 mt-2 w-[400px] bg-[#161618] border border-white/10 rounded-xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-5"><div className="flex justify-between items-center border-b border-white/5 pb-2"><span className="text-sm font-bold text-white">筛选条件</span><button onClick={clearFilters} className="text-xs text-spark-accent hover:underline flex items-center gap-1"><RotateCcw size={10} /> 重置</button></div><div><div className="text-xs font-bold text-white/40 uppercase mb-2">性别</div><div className="flex gap-2">{['Male', 'Female'].map(g => <button key={g} onClick={() => setGenderFilter(genderFilter === g ? null : g)} className={`px-3 py-1.5 rounded text-xs border transition-all ${genderFilter === g ? 'bg-spark-accent text-white' : 'bg-white/5 text-white/60'}`}>{g === 'Male' ? '男性' : '女性'}</button>)}</div></div><div><div className="text-xs font-bold text-white/40 uppercase mb-2">角色</div><div className="flex flex-wrap gap-2">{allCategories.map(cat => <button key={cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)} className={`px-3 py-1.5 rounded text-xs border transition-all ${catFilter === cat ? 'bg-spark-accent text-white' : 'bg-white/5 text-white/60'}`}>{translateCategory(cat)}</button>)}</div></div></div>}</div></div>
       <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar">{activeTab === Page.CUSTOM && <div onClick={() => onNavigate(Page.VOICE_CLONING)} className="w-full h-16 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all mb-3"><Mic className="text-white/40" size={20} /><span className="text-sm font-bold text-white/60">创建新声音</span></div>}<div className="space-y-2">{getFilteredVoices().map(voice => {
              const playing = currentVoice?.id === voice.id && isPlaying;
              const isSelected = selectedVoice.id === voice.id;
              return (<div key={voice.id} className={`group flex items-center p-4 rounded-xl transition-all border ${playing ? 'bg-[#1a1a1c] border-spark-accent/30' : 'bg-[#1a1a1c]/60 border-transparent hover:border-white/5'}`}><div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}><img src={voice.avatarUrl} alt={voice.name} className="w-14 h-14 rounded-lg object-cover bg-black/20" /><div className={`absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{playing ? <Pause size={20} fill="white" className="text-white" /> : <Play size={20} fill="white" className="text-white ml-0.5" />}</div></div><div className="flex-1 ml-5 min-w-0 flex flex-col justify-center"><div className="flex items-center gap-2 mb-1.5"><h3 className={`text-base font-bold truncate ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>{isSelected && <span className="text-xs bg-spark-accent/20 text-spark-accent px-1.5 py-0.5 rounded font-bold">已选</span>}<span className={`text-xs px-2 py-0.5 rounded font-bold flex items-center ${voice.gender === 'Male' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>{voice.gender === 'Male' ? '男' : '女'}</span></div><p className="text-sm text-white/50 truncate pr-4">{voice.description || `${translateCategory(voice.category)}，${translateLang(voice.language)}。`}</p></div><div className="flex items-center gap-3"><button onClick={() => { setSelectedVoice(voice); onNavigate(Page.TTS); }} className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-spark-accent text-white' : 'bg-white/5 text-white/70 hover:text-white'}`}>{isSelected ? '已选' : '选择'}</button><button onClick={() => toggleFavorite(voice.id)} className={`p-2.5 rounded-lg ${voice.isFavorite ? 'text-red-500' : 'text-white/20 hover:text-white'}`}><Heart size={20} fill={voice.isFavorite ? "currentColor" : "none"} /></button></div></div>);
            })}</div></div>
    </div>
  );
};

export default VoiceLibrary;
