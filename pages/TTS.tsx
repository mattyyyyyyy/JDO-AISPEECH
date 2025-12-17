import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Download, Rewind, FastForward, X, Search, Speaker, Check, RefreshCcw, Sliders, History, Star, User, Globe, Mic, AlertCircle, Heart, Languages, ChevronDown, Smile } from 'lucide-react';
import { translateCategory } from '../constants';
import { generateSpeech, pcmToWavBlob, translateContent } from '../services/geminiService';
import { Voice } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { useTTS } from '../contexts/TTSContext';
import { useVoices } from '../contexts/VoiceContext';
import { useLanguage } from '../contexts/LanguageContext';
import PlayerBar from '../components/PlayerBar';

const TTS: React.FC = () => {
  // Use Global TTS State
  const { text, setText, selectedVoice, setSelectedVoice } = useTTS();
  const { voices, toggleFavorite } = useVoices(); // Use global voices
  const { t } = useLanguage();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [error, setError] = useState<string | null>(null);
  
  // Voice Modal Tab State
  const [voiceCategory, setVoiceCategory] = useState<'preset' | 'discover' | 'custom' | 'favorites'>('preset');
  
  // Settings State
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1);
  const [emotion, setEmotion] = useState('natural');

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const translateMenuRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Global Player Context for voice previews
  const { playVoice, currentVoice, isPlaying: isGlobalPlaying, closePlayer: closeGlobalPlayer } = usePlayer();

  // Close translate menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
        setShowTranslateMenu(false);
      }
    };
    if (showTranslateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTranslateMenu]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    
    // Stop global player if it is playing to avoid audio clash
    if (isGlobalPlaying || currentVoice) {
      closeGlobalPlayer();
    }
    
    try {
      // Call the Real Gemini API
      const base64 = await generateSpeech(text, selectedVoice.name);
      
      if (base64) {
          const wavBlob = pcmToWavBlob(base64, 24000);
          // Revoke previous URL if exists (React state doesn't track it, but good practice if we stored it in ref)
          const newUrl = URL.createObjectURL(wavBlob);
          setAudioUrl(newUrl);
          
          // Reset states
          setCurrentTime(0);
          setDuration(0);
          // We rely on autoPlay prop on the audio element to start playing
      } else {
        setError("未收到音频数据，请重试。");
      }
    } catch (err: any) {
      console.error("TTS Generation Error:", err);
      setError(err.message || "生成音频失败，请检查 API Key 或网络。");
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
          setError("翻译失败，请稍后重试");
      } finally {
          setIsTranslating(false);
      }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
       setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const adjustTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // Sync isPlaying state with actual audio events
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  const translateGender = (gender: string) => gender === 'Male' ? '男' : '女';
  const translateLang = (lang: string) => lang === 'Chinese' ? '中文' : '英文';

  const getFilteredVoices = () => {
    switch (voiceCategory) {
      case 'preset': return voices.filter(v => v.source === 'preset');
      case 'discover': return voices.filter(v => v.source === 'community');
      case 'custom': return voices.filter(v => v.source === 'custom' || v.isCustom);
      case 'favorites': return voices.filter(v => v.isFavorite);
      default: return voices;
    }
  };

  return (
    <div className="relative h-full flex flex-col lg:flex-row animate-in fade-in duration-500 gap-6 pb-6 lg:pb-0">
      
      {/* Center Column: Editor + Player Bar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         <div className="mb-4 shrink-0">
            <h1 className="text-2xl font-bold text-white mb-1">{t('tts_title')}</h1>
            <p className="text-xs text-white/50">{t('tts_desc')}</p>
         </div>

         {/* Editor Card */}
         <div className="flex-1 bg-[#161618] rounded-2xl border border-white/10 flex flex-col relative overflow-hidden shadow-2xl transition-all duration-300 min-h-0">
            {/* Text Area */}
            <textarea
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-lg text-white/90 leading-relaxed font-light p-8 scrollbar-hide placeholder-white/20"
              placeholder={t('tts_placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            {/* Bottom Action Bar inside the card */}
            <div className="h-16 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-6 shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    {/* Translate Button Dropdown */}
                    <div className="relative" ref={translateMenuRef}>
                        <button 
                           onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                           disabled={isTranslating || !text.trim()}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${isTranslating ? 'bg-white/5 border-transparent text-white/30' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20'}`}
                        >
                            <Languages size={14} /> 
                            {isTranslating ? t('translating') : t('translate')}
                            <ChevronDown size={12} className="opacity-50" />
                        </button>

                        {/* Dropdown Menu */}
                        {showTranslateMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-40 bg-[#161618] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                                <div className="px-3 py-2 text-[10px] font-bold text-white/40 uppercase bg-white/[0.02]">{t('translate_to')}</div>
                                {[
                                    { code: 'English', label: t('translate_en') },
                                    { code: 'Chinese', label: t('translate_zh') },
                                    { code: 'Japanese', label: t('translate_ja') },
                                    { code: 'Korean', label: t('translate_ko') },
                                    { code: 'French', label: t('translate_fr') },
                                ].map((l) => (
                                    <button
                                        key={l.code}
                                        onClick={() => handleTranslate(l.code)}
                                        className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-xs text-white/30 font-mono">
                      {text.length} / 5,000 {t('char_count')}
                   </div>
                   <button 
                      onClick={() => setText('')} 
                      className="p-2 text-white/30 hover:text-white transition-colors"
                      title={t('clear')}
                   >
                     <RefreshCcw size={16} />
                   </button>
                   <div className="h-4 w-px bg-white/10 mx-2"></div>
                   
                   {/* Generate Button with Regenerate State */}
                   <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !text}
                      className={`
                        px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2
                        ${isGenerating || !text
                          ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                          : 'bg-[#6366f1] hover:bg-[#5558dd] text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'}
                      `}
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        audioUrl ? <RefreshCcw size={16} /> : <Speaker size={16} />
                      )}
                      
                      {isGenerating ? t('generating') : (audioUrl ? t('regenerate') : t('generate_audio'))}
                   </button>
                </div>
            </div>
            
            {/* Error Toast */}
            {error && (
                <div className="absolute bottom-20 left-6 right-6 z-30 animate-in slide-in-from-bottom-2">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-md">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto hover:text-white"><X size={16}/></button>
                    </div>
                </div>
            )}
         </div>

         {/* Adaptive Player Bar (Inserts into flow, pushing editor up) */}
         {audioUrl && (
            <div className="mt-4 animate-in slide-in-from-bottom-5 fade-in duration-300 shrink-0">
               {/* Hidden Audio Element */}
               <audio 
                 ref={audioRef} 
                 src={audioUrl} 
                 autoPlay
                 onPlay={onPlay}
                 onPause={onPause}
                 onEnded={() => setIsPlaying(false)}
                 onTimeUpdate={handleTimeUpdate}
                 onLoadedMetadata={handleLoadedMetadata}
                 onError={(e) => {
                    console.error("Audio playback error", e);
                    setError("音频播放失败");
                 }}
               />
               
               <PlayerBar
                  avatarUrl={selectedVoice.avatarUrl}
                  title={text.length > 0 ? (text.slice(0, 30) + (text.length > 30 ? '...' : '')) : "生成的音频"}
                  subTitle="生成内容预览"
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                  onClose={() => {
                    setAudioUrl(null);
                    setIsPlaying(false);
                  }}
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                  onForward={() => adjustTime(5)}
                  onRewind={() => adjustTime(-5)}
                  actionButton={
                     <button 
                       className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                       title="下载"
                     >
                       <Download size={18} />
                     </button>
                  }
               />
            </div>
         )}
      </div>

      {/* Right: Settings Panel */}
      <div className="w-full lg:w-80 flex h-full bg-[#161618] border border-white/10 rounded-2xl overflow-hidden shadow-xl shrink-0">
         
         {/* Settings Content Area */}
         <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-[#161618]">
            {activeTab === 'settings' && (
              <>
                 {/* Voice Card */}
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-white/50">{t('voice_settings')}</span>
                       <button onClick={() => { setSpeed(1); setPitch(0); setVolume(1); setEmotion('natural'); }} className="text-[10px] text-white/30 hover:text-white transition-colors">{t('param_reset')}</button>
                    </div>
                    
                    <div 
                      onClick={() => setShowVoiceModal(true)}
                      className="group p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#6366f1]/50 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden"
                    >
                      <img src={selectedVoice.avatarUrl} alt={selectedVoice.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                          <div className="text-sm font-bold text-white">{selectedVoice.name}</div>
                          <div className="text-[10px] text-white/50 mt-0.5">{selectedVoice.flag} {translateLang(selectedVoice.language)} • {translateCategory(selectedVoice.category)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#6366f1] transition-colors">
                         <RefreshCcw size={14} className="text-white/70 group-hover:text-white" />
                      </div>
                    </div>
                 </div>

                 {/* Parameters */}
                 <div className="space-y-6">
                   <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-white/50">{t('voice_effects')}</span>
                   </div>
                   
                   {/* Emotion Selector */}
                   <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                           <Smile size={12} className="text-white/50" />
                           <span className="text-xs text-white/70">{t('emotion')}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                           {[
                               { id: 'natural', label: t('emotion_natural') },
                               { id: 'happy', label: t('emotion_happy') },
                               { id: 'sad', label: t('emotion_sad') },
                               { id: 'angry', label: t('emotion_angry') },
                               { id: 'excited', label: t('emotion_excited') },
                               { id: 'whisper', label: t('emotion_whisper') },
                           ].map((em) => (
                               <button
                                   key={em.id}
                                   onClick={() => setEmotion(em.id)}
                                   className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${emotion === em.id ? 'bg-[#6366f1]/20 border-[#6366f1] text-white' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'}`}
                               >
                                   {em.label}
                               </button>
                           ))}
                       </div>
                   </div>

                   <div className="space-y-4 pt-2 border-t border-white/5">
                     <div className="space-y-2">
                       <div className="flex justify-between text-xs text-white/70"><span>{t('speed')}</span> <span>{speed}x</span></div>
                       <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]" />
                     </div>

                     <div className="space-y-2">
                       <div className="flex justify-between text-xs text-white/70"><span>{t('pitch')}</span> <span>{pitch > 0 ? '+' + pitch : pitch}</span></div>
                       <input type="range" min="-10" max="10" step="1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]" />
                     </div>

                     <div className="space-y-2">
                       <div className="flex justify-between text-xs text-white/70"><span>{t('volume')}</span> <span>{Math.round(volume * 100)}%</span></div>
                       <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#6366f1]" />
                     </div>
                   </div>
                 </div>
              </>
            )}

            {activeTab === 'history' && (
               <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                   <History size={32} />
                   <span className="text-sm">暂无生成历史</span>
               </div>
            )}
         </div>

         {/* Vertical Toolbar on the Right */}
         <div className="w-14 border-l border-white/5 bg-white/[0.02] flex flex-col items-center py-4 gap-2">
            <button 
               onClick={() => setActiveTab('settings')}
               className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
               title={t('debug_panel')}
            >
               <Sliders size={20} />
            </button>
            <button 
               onClick={() => setActiveTab('history')}
               className={`p-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
               title={t('history_panel')}
            >
               <History size={20} />
            </button>
         </div>
      </div>

      {/* Voice Selection Modal (Portal) */}
      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div>
           <div className="relative w-[900px] max-h-[85vh] bg-[#12141a] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/10">
             {/* Header */}
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161618]">
               <div>
                  <h2 className="text-xl font-bold text-white">{t('sound_library')}</h2>
                  <p className="text-xs text-white/50 mt-1">丰富的声音库，满足各种场景需求</p>
               </div>
               <button onClick={() => setShowVoiceModal(false)} className="text-white/50 hover:text-white p-2 rounded-lg hover:bg-white/10"><X size={24} /></button>
             </div>

             {/* Categories */}
             <div className="px-6 border-b border-white/5 bg-[#161618]/50 flex gap-1">
                {[
                  { id: 'preset', label: t('preset'), icon: Mic },
                  { id: 'discover', label: t('discover'), icon: Globe },
                  { id: 'custom', label: t('custom'), icon: User },
                  { id: 'favorites', label: t('favorites'), icon: Star },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setVoiceCategory(cat.id as any)}
                    className={`
                      px-4 py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2
                      ${voiceCategory === cat.id ? 'border-[#6366f1] text-white' : 'border-transparent text-white/40 hover:text-white'}
                    `}
                  >
                    <cat.icon size={16} /> {cat.label}
                  </button>
                ))}
             </div>

             {/* Filters */}
             <div className="px-6 py-4 border-b border-white/5 bg-[#161618]/50 flex gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-3 top-2.5 text-white/30" size={16} />
                     <input className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-[#6366f1] outline-none placeholder-white/20" placeholder={t('search_voice')} />
                  </div>
             </div>

             {/* List (Slim Style) */}
             <div className="flex-1 overflow-y-auto p-6 bg-[#12141a]">
                <div className="space-y-2">
                  {getFilteredVoices().map(voice => {
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
                  
                  {getFilteredVoices().length === 0 && (
                     <div className="py-10 flex flex-col items-center justify-center text-white/20">
                        <p>该分类下暂无声音</p>
                     </div>
                  )}
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
