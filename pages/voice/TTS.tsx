
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Download, X, Search, Speaker, RefreshCcw, Sliders, History, Star, User, Globe, Mic, AlertCircle, Heart, Languages, ChevronDown, Smile } from 'lucide-react';
import { translateCategory } from '../../constants';
import { generateSpeech, pcmToWavBlob, translateContent } from '../../services/geminiService';
import { usePlayer } from '../../contexts/PlayerContext';
import { useTTS } from '../../contexts/TTSContext';
import { useVoices } from '../../contexts/VoiceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PlayerBar from '../../components/PlayerBar';

const TTS: React.FC = () => {
  const { text, setText, selectedVoice, setSelectedVoice } = useTTS();
  const { voices, toggleFavorite } = useVoices();
  const { t } = useLanguage();

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [voiceCategory, setVoiceCategory] = useState<'preset' | 'discover' | 'custom' | 'favorites'>('preset');
  
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1);
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

  return (
    <div className="relative h-full flex flex-col lg:flex-row animate-in fade-in duration-500 gap-6 pb-6 lg:pb-0">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
         <div className="mb-4 shrink-0"><h1 className="text-3xl font-black text-white mb-2">{t('tts_title')}</h1><p className="text-sm text-white/50">{t('tts_desc')}</p></div>
         <div className="flex-1 bg-[#161618] rounded-[2rem] border border-white/10 flex flex-col relative overflow-hidden shadow-2xl min-h-0">
            <textarea className="flex-1 w-full bg-transparent border-none outline-none resize-none text-xl text-white/90 leading-relaxed font-light p-10 scrollbar-hide placeholder-white/20" placeholder={t('tts_placeholder')} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="h-20 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-8 shrink-0 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="relative" ref={translateMenuRef}>
                        <button onClick={() => setShowTranslateMenu(!showTranslateMenu)} disabled={isTranslating || !text.trim()} className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isTranslating ? 'bg-white/5 border-transparent text-white/30' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30'}`}><Languages size={18} /> {isTranslating ? t('translating') : t('translate')}<ChevronDown size={14} className="opacity-50" /></button>
                        {showTranslateMenu && <div className="absolute bottom-full left-0 mb-3 w-48 bg-[#161618] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in"><div className="px-4 py-3 text-xs font-black text-white/40 uppercase bg-white/[0.02] tracking-widest">{t('translate_to')}</div>{[{ code: 'English', label: t('translate_en') }, { code: 'Chinese', label: t('translate_zh') }].map((l) => <button key={l.code} onClick={() => handleTranslate(l.code)} className="w-full text-left px-5 py-3 text-base text-white/80 hover:bg-white/10 hover:text-white transition-colors">{l.label}</button>)}</div>}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-sm text-white/30 font-mono font-bold">{text.length.toLocaleString()} / 5,000 {t('char_count')}</div>
                    <button onClick={() => setText('')} className="p-2.5 text-white/30 hover:text-white transition-colors hover:bg-white/5 rounded-lg"><RefreshCcw size={20} /></button>
                    <button onClick={handleGenerate} disabled={isGenerating || !text} className={`px-8 py-3 rounded-xl font-black text-base shadow-xl transition-all flex items-center gap-3 ${isGenerating || !text ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white transform hover:scale-[1.02] active:scale-[0.98]'}`}>{isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (audioUrl ? <RefreshCcw size={20} /> : <Speaker size={20} />)}{isGenerating ? t('generating') : (audioUrl ? t('regenerate') : t('generate_audio'))}</button>
                </div>
            </div>
            {error && <div className="absolute bottom-24 left-8 right-8 z-30 animate-in slide-in-from-bottom-2"><div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-xl"><AlertCircle size={22} /> <span className="text-base font-medium">{error}</span> <button onClick={() => setError(null)} className="ml-auto hover:text-white p-1 rounded-lg hover:bg-white/10"><X size={20}/></button></div></div>}
         </div>
         {audioUrl && <div className="mt-6 animate-in slide-in-from-bottom-5 fade-in duration-300 shrink-0"><audio ref={audioRef} src={audioUrl} autoPlay onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} /><PlayerBar avatarUrl={selectedVoice.avatarUrl} title={text.slice(0, 40) + (text.length > 40 ? '...' : '')} subTitle="生成内容预览" isPlaying={isPlaying} onTogglePlay={togglePlay} onClose={() => setAudioUrl(null)} currentTime={currentTime} duration={duration} onSeek={(t) => audioRef.current && (audioRef.current.currentTime = t)} actionButton={<button className="p-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"><Download size={22} /></button>} /></div>}
      </div>
      <div className="w-full lg:w-96 flex h-full bg-[#161618] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shrink-0">
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide bg-[#161618]">
          {activeTab === 'settings' && (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-xs font-black text-white/40 uppercase tracking-widest">{t('voice_settings')}</span><button onClick={() => { setSpeed(1); setPitch(0); }} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">{t('param_reset')}</button></div>
                <div onClick={() => setShowVoiceModal(true)} className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden shadow-lg"><img src={selectedVoice.avatarUrl} alt={selectedVoice.name} className="w-12 h-12 rounded-xl object-cover" /><div className="flex-1"><div className="text-base font-black text-white">{selectedVoice.name}</div><div className="text-xs text-white/40 font-bold mt-1 uppercase tracking-wide">{selectedVoice.language === 'Chinese' ? '中文 (ZH)' : '英文 (EN)'}</div></div><div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-indigo-600 transition-all transform group-hover:rotate-12"><RefreshCcw size={18} className="text-white/70 group-hover:text-white" /></div></div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4"><Smile size={16} className="text-white/40" /><span className="text-xs font-black text-white/40 uppercase tracking-widest">{t('emotion')}</span></div>
                <div className="grid grid-cols-2 gap-3">
                  {[{ id: 'natural', label: t('emotion_natural') }, { id: 'happy', label: t('emotion_happy') }, { id: 'sad', label: t('emotion_sad') }, { id: 'excited', label: t('emotion_excited') }].map((em) => (
                    <button key={em.id} onClick={() => setEmotion(em.id)} className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${emotion === em.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-inner' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'}`}>{em.label}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="w-16 border-l border-white/5 bg-white/[0.02] flex flex-col items-center py-6 gap-4"><button onClick={() => setActiveTab('settings')} className={`p-3.5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}><Sliders size={24} /></button><button onClick={() => setActiveTab('history')} className={`p-3.5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}><History size={24} /></button></div>
      </div>
      {showVoiceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"><div className="absolute inset-0" onClick={() => setShowVoiceModal(false)}></div><div className="relative w-[1000px] max-h-[85vh] bg-[#12141a] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95"><div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#161618]"><div><h2 className="text-3xl font-black text-white">{t('sound_library')}</h2></div><button onClick={() => setShowVoiceModal(false)} className="text-white/40 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all"><X size={32} /></button></div><div className="flex-1 overflow-y-auto p-8 bg-[#12141a] custom-scrollbar"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{voices.map(voice => (
          <div key={voice.id} className="group flex items-center p-5 rounded-2xl transition-all border bg-[#1a1a1c]/60 border-transparent hover:border-white/10 hover:bg-[#202022] shadow-sm hover:shadow-xl"><div className="relative cursor-pointer shrink-0" onClick={() => playVoice(voice)}><img src={voice.avatarUrl} alt={voice.name} className="w-16 h-16 rounded-2xl object-cover bg-black/40 border border-white/5" /><div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all"><Play size={24} fill="white" className="text-white" /></div></div><div className="flex-1 ml-6 min-w-0"><div className="flex items-center gap-3 mb-1.5"><h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{voice.name}</h3></div><p className="text-sm text-white/40 font-medium uppercase tracking-wider">{voice.gender === 'Male' ? '男性 (Male)' : '女性 (Female)'} • {voice.language === 'Chinese' ? '中文' : 'English'}</p></div><div className="flex items-center gap-4"><button onClick={() => { setSelectedVoice(voice); setShowVoiceModal(false); }} className="px-6 py-2.5 rounded-full text-sm font-black bg-white/5 text-white/80 border border-white/5 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-md">选择</button><button onClick={() => toggleFavorite(voice.id)} className={`p-3 rounded-xl transition-all ${voice.isFavorite ? 'text-red-500 bg-red-500/5 shadow-inner' : 'text-white/20 hover:text-red-400 hover:bg-white/5'}`}><Heart size={22} fill={voice.isFavorite ? "currentColor" : "none"} /></button></div></div>
        ))}</div></div></div></div>, document.body
      )}
    </div>
  );
};

export default TTS;
