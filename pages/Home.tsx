import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassCard from '../components/GlassCard';
import { Play, Pause, Mic, Sparkles, Send, ChevronDown, Wand2, Music, Video, ArrowRight, Zap, X, Search, Check, Heart } from 'lucide-react';
import { Page, Voice } from '../types';
import { translateCategory } from '../constants';
import { usePlayer } from '../contexts/PlayerContext';
import { useTTS } from '../contexts/TTSContext';
import { useVoices } from '../contexts/VoiceContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  // Use Global TTS State
  const { text, setText, selectedVoice, setSelectedVoice } = useTTS();
  const { voices, toggleFavorite } = useVoices(); // Use Global Voices
  const { t } = useLanguage();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null); // Shadow ref for height calculation
  
  // Use Player Context
  const { playVoice, currentVoice, isPlaying } = usePlayer();

  // Auto-resize textarea with smooth transition
  useEffect(() => {
    if (shadowRef.current && textareaRef.current) {
      // Reset shadow height to allow accurate scrollHeight measurement
      shadowRef.current.style.height = '0px'; 
      
      const scrollHeight = shadowRef.current.scrollHeight;
      // Calculate new height, maxing out at double the base (320px)
      const newHeight = Math.min(Math.max(scrollHeight, 160), 320);
      
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const FEATURED_STYLES = [
    { id: 'f1', name: '睡前低语', tag: 'ASMR', subTag: '日语', color: 'from-spark-dark/60 to-spark-accent/20', icon: '🌙' },
    { id: 'f2', name: '恐怖故事', tag: '恐怖', subTag: '英语', color: 'from-red-900/60 to-orange-900/20', icon: '👻' },
    { id: 'f3', name: '哥布林', tag: '角色', subTag: '英语', color: 'from-green-900/60 to-emerald-900/20', icon: '👺' },
    { id: 'f4', name: '讲座演讲', tag: '教育', subTag: '英语', color: 'from-blue-900/60 to-cyan-900/20', icon: '🎤' },
    { id: 'f5', name: '推销路演', tag: '演讲', subTag: '英语', color: 'from-yellow-900/60 to-amber-900/20', icon: '💼' },
    { id: 'f6', name: '科幻风格', tag: '赛博朋克', subTag: '机器人', color: 'from-spark-accent/60 to-spark-dark/20', icon: '🤖' },
  ];

  const handlePlayStyle = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    // Create a temporary voice object for playback
    const tempVoice: Voice = {
      id: item.id,
      name: item.name,
      gender: 'Female', // Default generic
      language: 'Chinese', // Default generic
      tags: [item.tag, item.subTag],
      category: 'Narrator',
      avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}`,
      previewUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg", // Demo audio
    };
    playVoice(tempVoice);
  };

  const translateLang = (lang: string) => lang === 'Chinese' ? '中文' : '英文';
  const translateGender = (gender: string) => gender === 'Male' ? '男' : '女';


  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 overflow-y-auto h-full pr-2">
      
      {/* Header Section */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-white tracking-wide drop-shadow-sm">
          {t('home_title')}
        </h1>
      </div>

      {/* Main Input Area */}
      <GlassCard className="!p-0 overflow-hidden border-white/10 shadow-2xl relative group bg-white/[0.02]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {/* Text Area Container */}
        <div className="relative p-0 pb-20">
          {/* Shadow Textarea for accurate height calculation (Hidden) */}
          <textarea 
            ref={shadowRef}
            value={text}
            readOnly
            aria-hidden="true"
            className="absolute top-0 left-0 w-full -z-10 opacity-0 pointer-events-none text-lg text-white font-light leading-relaxed resize-none border-none outline-none p-[15px] scrollbar-hide"
            tabIndex={-1}
          />

          {/* Visible Textarea */}
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('home_input_placeholder')}
            // Padding changed to p-[15px] as requested
            className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-white/30 resize-none font-light leading-relaxed scrollbar-hide p-[15px] transition-[height] duration-300 ease-in-out"
            style={{ height: '160px' }} // Initial height
          />
        </div>

        {/* Bottom Toolbar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#020204]/60 border-t border-white/10 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            
            {/* Voice Selector */}
            <div 
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs cursor-pointer hover:border-spark-accent transition-colors group/voice"
            >
              <img src={selectedVoice.avatarUrl} className="w-5 h-5 rounded-full border border-white/20" />
              <span className="font-bold group-hover/voice:text-white transition-colors">{selectedVoice.name}</span>
              <span className="text-white/50 border-l border-white/10 pl-2 ml-1">{translateCategory(selectedVoice.category)}</span>
              <ChevronDown size={12} className="text-white/50 ml-1" />
            </div>
          </div>

          <button 
             onClick={() => onNavigate(Page.TTS)}
             className="px-6 py-2 rounded-full bg-gradient-to-r from-spark-accent to-spark-dark text-white font-bold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 transition-all flex items-center gap-2 border border-white/10"
          >
            <Wand2 size={16} /> {t('generate_audio')}
          </button>
        </div>
      </GlassCard>

      {/* Featured Voices Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-white">{t('find_voice')}</h2>
          <button 
             onClick={() => onNavigate(Page.DISCOVER)}
             className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
          >
             {t('find_more')} <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_STYLES.map((item) => {
            const isCurrent = currentVoice?.id === item.id;
            const playing = isCurrent && isPlaying;
            
            return (
              <div 
                key={item.id} 
                onClick={(e) => handlePlayStyle(e, item)}
                className={`
                  aspect-square rounded-2xl bg-gradient-to-br ${item.color} 
                  border transition-all cursor-pointer group relative overflow-hidden
                  ${playing ? 'border-spark-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-spark-accent/40'}
                `}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                   <div className={`text-4xl transition-transform duration-300 drop-shadow-md ${playing ? 'scale-110 grayscale-0' : 'group-hover:scale-110 filter grayscale-[0.2] group-hover:grayscale-0'}`}>{item.icon}</div>
                   
                   <button 
                      onClick={(e) => handlePlayStyle(e, item)}
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm
                        ${playing 
                          ? 'opacity-100 translate-y-0 bg-spark-accent text-white shadow-lg' 
                          : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 bg-white/20 hover:bg-white hover:text-spark-bg'}
                      `}
                   >
                      {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                   </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-spark-bg to-transparent">
                  <div className="font-bold text-white text-sm mb-1">{item.name}</div>
                  <div className="flex gap-2">
                     <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/90 backdrop-blur-sm border border-white/5">{item.subTag}</span>
                     <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/90 backdrop-blur-sm border border-white/5">{item.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Selection Modal (Portal) - High Z-Index to clear sidebar */}
      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div>
           
           <div className="relative w-[900px] max-h-[80vh] bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161618]">
                <h3 className="text-xl font-bold text-white">{t('sound_library')}</h3>
                <button onClick={() => setShowVoiceModal(false)} className="text-white/50 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                   <X size={24} />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-white/5 flex gap-4 bg-[#161618]/50">
                 <div className="relative flex-1">
                     <Search className="absolute left-3 top-2.5 text-white/50" size={16} />
                     <input className="w-full bg-spark-surface border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-spark-accent outline-none" placeholder={t('search_voice')} />
                 </div>
                 <div className="flex gap-2">
                    {[t('all'), '中文', '英文'].map(l => (
                       <button key={l} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 hover:text-white transition-colors">{l}</button>
                    ))}
                 </div>
              </div>

              {/* Slim List */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#12141a]">
                 <div className="space-y-2">
                    {voices.map(voice => {
                       const isCurrent = currentVoice?.id === voice.id;
                       const playing = isCurrent && isPlaying;
                       const isSelected = selectedVoice.id === voice.id;
                       
                       return (
                       <div 
                          key={voice.id}
                          className={`
                            group flex items-center p-3 rounded-xl transition-all border
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
                               <img src={voice.avatarUrl} alt={voice.name} className="w-12 h-12 rounded-lg object-cover bg-black/20" />
                               <div className={`
                                 absolute inset-0 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all
                                 ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                               `}>
                                  {playing ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="text-white ml-0.5" />}
                               </div>
                           </div>

                           {/* Info */}
                           <div className="flex-1 ml-4 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className={`text-sm font-bold truncate ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                                 {isSelected && <span className="text-[10px] bg-spark-accent/20 text-spark-accent px-1.5 py-0.5 rounded font-bold">{t('selected')}</span>}
                              </div>
                              <p className="text-xs text-white/40 truncate">
                                 {translateGender(voice.gender)} • {translateLang(voice.language)} • {translateCategory(voice.category)}
                              </p>
                           </div>

                           {/* Actions */}
                           <div className="flex items-center gap-3">
                              <button 
                                 onClick={() => {
                                   setSelectedVoice(voice);
                                   setShowVoiceModal(false);
                                 }}
                                 className={`
                                    px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                                    ${isSelected 
                                       ? 'bg-spark-accent text-white border-spark-accent shadow-lg shadow-spark-accent/20' 
                                       : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'}
                                 `}
                              >
                                 {isSelected ? t('selected') : t('select')}
                              </button>

                              <button
                                 onClick={(e) => { e.stopPropagation(); toggleFavorite(voice.id); }}
                                 className={`p-2 rounded-lg transition-colors ${voice.isFavorite ? 'text-red-500' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                              >
                                 <Heart size={18} fill={voice.isFavorite ? "currentColor" : "none"} />
                              </button>
                           </div>
                        </div>
                    )})}
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Home;
