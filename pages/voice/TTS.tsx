
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Download, X, Speaker, RefreshCcw, Sliders, History, AlertCircle, Heart, Languages, ChevronDown, Smile, Gauge, Music2, Volume2, Search, Filter } from 'lucide-react';
import { translateCategory } from '../../constants';
import { generateSpeech, pcmToWavBlob, translateContent } from '../../services/geminiService';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTTS } from '../../contexts/TTSContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PlayerBar from '../../components/PlayerBar';
import { Page, Voice } from '../../types';

const TTS: React.FC = () => {
  const { text, setText, selectedVoice, setSelectedVoice } = useTTS();
  const { voices, toggleFavorite, tags } = useVoices();
  const { t } = useLanguage();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [modalTab, setModalTab] = useState<'community' | 'preset' | 'custom'>('preset');
  const [modalSearch, setModalSearch] = useState('');
  const [modalTag, setModalTag] = useState<string | null>(null);

  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [emotion, setEmotion] = useState('natural');

  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const translateMenuRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { playVoice, currentVoice, isPlaying: isGlobalPlaying, closePlayer: closeGlobalPlayer } = usePlayer();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
        setShowTranslateMenu(false);
      }
    };
    if (showTranslateMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTranslateMenu]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    if (isGlobalPlaying || currentVoice) closeGlobalPlayer();
    try {
      const base64 = await generateSpeech(text, selectedVoice.name);
      if (base64) {
          const wavBlob = pcmToWavBlob(base64, 24000);
          setAudioUrl(URL.createObjectURL(wavBlob));
          setCurrentTime(0);
          setDuration(0);
      } else {
        setError("未收到音频数据，请重试。");
      }
    } catch (err: any) {
      setError(err.message || "生成音频失败。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async (targetLang: string) => {
      if (!text.trim()) return;
      setIsTranslating(true);
      setShowTranslateMenu(false);
      try {
          const translated = await translateContent(text, targetLang);
          setText(translated);
      } catch (e) {
          setError("翻译失败。");
      } finally {
          setIsTranslating(false);
      }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const emotions = [
    { id: 'natural', label: t('emotion_natural'), icon: '✨' },
    { id: 'happy', label: t('emotion_happy'), icon: '😊' },
    { id: 'sad', label: t('emotion_sad'), icon: '😢' },
    { id: 'angry', label: t('emotion_angry'), icon: '😤' },
    { id: 'excited', label: t('emotion_excited'), icon: '🤩' },
    { id: 'whisper', label: t('emotion_whisper'), icon: '🤫' },
    { id: 'friendly', label: '友好', icon: '🤝' },
    { id: 'serious', label: '严肃', icon: '🧐' },
  ];

  const filteredModalVoices = useMemo(() => {
    return voices.filter(v => {
      const matchTab = v.source === modalTab || (modalTab === 'custom' && v.isCustom);
      const matchSearch = v.name.toLowerCase().includes(modalSearch.toLowerCase());
      const matchTag = !modalTag || v.tags.includes(modalTag);
      return matchTab && matchSearch && matchTag;
    });
  }, [voices, modalTab, modalSearch, modalTag]);

  return (
    <div className="relative h-full flex flex-col lg:flex-row animate-in fade-in duration-500 gap-6 pb-6 lg:pb-0">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         <div className="mb-4 shrink-0"><h1 className="text-3xl font-black text-white mb-1">{t('tts_title')}</h1><p className="text-sm text-white/40">{t('tts_desc')}</p></div>
         <div className="flex-1 bg-[#0f0f11] rounded-[2rem] border border-white/5 flex flex-col relative overflow-hidden shadow-2xl min-h-0">
            {/* Box text enlarged and made brighter/whiter as per screenshot request */}
            <textarea className="flex-1 w-full bg-transparent border-none outline-none resize-none text-3xl text-white font-medium p-10 scrollbar-hide placeholder-white/20" placeholder={t('tts_placeholder')} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="h-20 border-t border-white/5 bg-white/[0.01] flex justify-between items-center px-8 shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="relative" ref={translateMenuRef}>
                        <button onClick={() => setShowTranslateMenu(!showTranslateMenu)} disabled={isTranslating || !text.trim()} className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isTranslating ? 'bg-white/5 border-transparent text-white/30' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'}`}><Languages size={18} /> {isTranslating ? t('translating') : t('translate')}<ChevronDown size={14} className="opacity-50" /></button>
                        {showTranslateMenu && <div className="absolute bottom-full left-0 mb-3 w-48 bg-[#161618] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in"><div className="px-4 py-3 text-xs font-black text-white/40 uppercase bg-white/[0.02] tracking-widest">{t('translate_to')}</div>{[{ code: 'English', label: t('translate_en') }, { code: 'Chinese', label: t('translate_zh') }].map((l) => <button key={l.code} onClick={() => handleTranslate(l.code)} className="w-full text-left px-5 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white transition-colors">{l.label}</button>)}</div>}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-sm text-white/30 font-mono font-bold">{text.length.toLocaleString()} / 5,000</div>
                    <button onClick={() => setText('')} className="p-2.5 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-lg"><RefreshCcw size={20} /></button>
                    <button onClick={handleGenerate} disabled={isGenerating || !text} className={`px-8 py-3 rounded-xl font-black text-base shadow-xl transition-all flex items-center gap-3 ${isGenerating || !text ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-spark-accent hover:bg-blue-500 text-white transform hover:scale-[1.02] active:scale-[0.98]'}`}>{isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (audioUrl ? <RefreshCcw size={20} /> : <Speaker size={20} />)}{isGenerating ? t('generating') : (audioUrl ? t('regenerate') : t('generate_audio'))}</button>
                </div>
            </div>
            {error && <div className="absolute bottom-24 left-8 right-8 z-30 animate-in slide-in-from-bottom-2"><div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-xl"><AlertCircle size={22} /> <span className="text-base font-medium">{error}</span> <button onClick={() => setError(null)} className="ml-auto hover:text-white p-1 rounded-lg hover:bg-white/10"><X size={20}/></button></div></div>}
         </div>
         {audioUrl && <div className="mt-6 animate-in slide-in-from-bottom-5 fade-in duration-300 shrink-0"><audio ref={audioRef} src={audioUrl} autoPlay onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} /><PlayerBar avatarUrl={selectedVoice.avatarUrl} title={text.slice(0, 40) + (text.length > 40 ? '...' : '')} subTitle="生成音频预览" isPlaying={isPlaying} onTogglePlay={togglePlay} onClose={() => setAudioUrl(null)} currentTime={currentTime} duration={duration} onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} actionButton={<button className="p-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"><Download size={22} /></button>} /></div>}
      </div>
      <div className="w-full lg:w-[400px] flex h-full bg-[#0f0f11] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl shrink-0">
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {activeTab === 'settings' && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">{t('voice_settings')}</span><button onClick={() => { setSpeed(1.0); setPitch(0); setVolume(1.0); setEmotion('natural'); }} className="text-[10px] font-bold text-spark-accent hover:underline">{t('param_reset')}</button></div>
                <div onClick={() => setShowVoiceModal(true)} className="group p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-spark-accent/40 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden"><img src={selectedVoice.avatarUrl} alt={selectedVoice.name} className="w-12 h-12 rounded-xl object-cover" /><div className="flex-1 min-w-0"><div className="text-base font-bold text-white truncate">{selectedVoice.name}</div><div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{selectedVoice.language === 'Chinese' ? '普通话' : 'English (US)'}</div></div><div className="p-2 rounded-lg bg-white/5 group-hover:bg-spark-accent transition-colors"><RefreshCcw size={16} className="text-white/40 group-hover:text-white" /></div></div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2"><Smile size={16} className="text-white/60" /><span className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">{t('emotion')}</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {emotions.map((em) => (
                    <button key={em.id} onClick={() => setEmotion(em.id)} className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border transition-all ${emotion === em.id ? 'bg-spark-accent/20 border-spark-accent/50 text-white shadow-lg' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'}`}><span>{em.icon}</span> {em.label}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 pt-4">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/60 uppercase tracking-widest">
                       <div className="flex items-center gap-2"><Gauge size={14}/> {t('speed')}</div>
                       <span className="text-white font-mono text-sm">{speed.toFixed(1)}x</span>
                    </div>
                    <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-spark-accent" />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/60 uppercase tracking-widest">
                       <div className="flex items-center gap-2"><Music2 size={14}/> {t('pitch')}</div>
                       <span className="text-white font-mono text-sm">{pitch > 0 ? '+' : ''}{pitch}</span>
                    </div>
                    <input type="range" min="-10" max="10" step="1" value={pitch} onChange={(e) => setPitch(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-spark-accent" />
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-bold text-white/60 uppercase tracking-widest">
                       <div className="flex items-center gap-2"><Volume2 size={14}/> {t('volume')}</div>
                       <span className="text-white font-mono text-sm">{(volume * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="2.0" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-spark-accent" />
                 </div>
              </div>
            </>
          )}
        </div>
        <div className="w-16 border-l border-white/5 bg-white/[0.01] flex flex-col items-center py-6 gap-4"><button onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-spark-accent text-white' : 'text-white/20 hover:text-white/50'}`}><Sliders size={20} /></button><button onClick={() => setActiveTab('history')} className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-spark-accent text-white' : 'text-white/20 hover:text-white/50'}`}><History size={20} /></button></div>
      </div>
      
      {/* Enhanced Voice Selection Modal */}
      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div>
           <div className="relative w-[1000px] h-[85vh] bg-[#12141a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              
              {/* Header */}
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#161618]">
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight">{t('sound_library')}</h3>
                   <p className="text-sm text-white/40 mt-1">找到最适合这段文字的声音</p>
                </div>
                <button onClick={() => setShowVoiceModal(false)} className="text-white/40 hover:text-white p-3 hover:bg-white/10 rounded-xl transition-colors"><X size={32} /></button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar Filters */}
                <div className="w-72 border-r border-white/5 p-6 space-y-8 bg-black/20 overflow-y-auto">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('search_voice')}</span>
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                         <input 
                           value={modalSearch}
                           onChange={(e) => setModalSearch(e.target.value)}
                           className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-spark-accent/40 outline-none placeholder:text-white/10 transition-all" 
                           placeholder="关键词..." 
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">热门标签</span>
                         <button onClick={() => setModalTag(null)} className="text-[10px] font-bold text-spark-accent hover:underline">重置</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {tags.map(tag => (
                           <button 
                             key={tag} 
                             onClick={() => setModalTag(modalTag === tag ? null : tag)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${modalTag === tag ? 'bg-spark-accent/20 border-spark-accent text-white' : 'bg-white/5 border-white/[0.03] text-white/40 hover:text-white/60'}`}
                           >
                             #{tag}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-[#0f0f11]">
                   {/* Tabs Row */}
                   <div className="px-8 py-6 border-b border-white/5 flex gap-10 items-center">
                      {[
                        { id: 'community', label: '发现声音' },
                        { id: 'preset', label: '预设声音' },
                        { id: 'custom', label: '自定义声音' }
                      ].map(tItem => (
                        <button 
                          key={tItem.id} 
                          onClick={() => setModalTab(tItem.id as any)}
                          className={`relative py-2 text-base font-black transition-all ${modalTab === tItem.id ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                          {tItem.label}
                          {modalTab === tItem.id && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-spark-accent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />}
                        </button>
                      ))}
                      
                      <div className="ml-auto text-xs font-bold text-white/20 uppercase tracking-widest">
                        匹配项: {filteredModalVoices.length}
                      </div>
                   </div>

                   {/* Scrollable Voices List */}
                   <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-4">
                         {filteredModalVoices.length > 0 ? (
                           filteredModalVoices.map(voice => {
                              const playing = currentVoice?.id === voice.id && isGlobalPlaying;
                              const isSelected = selectedVoice.id === voice.id;
                              return (
                                <div 
                                  key={voice.id} 
                                  className={`group flex items-center p-5 rounded-2xl transition-all border ${playing ? 'bg-spark-accent/5 border-spark-accent/30 shadow-xl' : 'bg-white/[0.03] border-transparent hover:border-white/5 hover:bg-white/[0.05]'}`}
                                >
                                  <div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}>
                                      <img src={voice.avatarUrl} alt={voice.name} className="w-16 h-16 rounded-2xl object-cover bg-black/20 border border-white/5" />
                                      <div className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all ${playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                         {playing ? <Pause size={24} fill="white" className="text-white" /> : <Play size={24} fill="white" className="text-white ml-0.5" />}
                                      </div>
                                  </div>
                                  <div className="flex-1 ml-5 min-w-0">
                                     <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-base font-black truncate ${playing ? 'text-spark-accent' : 'text-white'}`}>{voice.name}</h3>
                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-spark-accent shadow-[0_0_5px_rgba(59,130,246,1)]" />}
                                     </div>
                                     <p className="text-xs text-white/30 uppercase font-black tracking-widest mt-0.5">{translateCategory(voice.category)}</p>
                                     <div className="flex gap-1.5 mt-2">
                                        {voice.tags.slice(0, 2).map(tag => (
                                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.03] text-white/20 font-bold uppercase tracking-widest">#{tag}</span>
                                        ))}
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => { setSelectedVoice(voice); setShowVoiceModal(false); }} 
                                    className={`px-6 py-2 rounded-xl text-xs font-black tracking-wide transition-all border ${isSelected ? 'bg-spark-accent border-spark-accent text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                  >
                                    {isSelected ? '已选择' : '使用'}
                                  </button>
                                </div>
                              );
                           })
                         ) : (
                           <div className="col-span-2 py-20 flex flex-col items-center justify-center text-white/10">
                              <Search size={48} className="mb-4 opacity-20" />
                              <p className="text-lg font-bold">没有找到匹配的声音</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>

           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TTS;
