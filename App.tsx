import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ASR from './pages/ASR';
import TTS from './pages/TTS';
import VoiceCloning from './pages/VoiceCloning';
import Diarization from './pages/Diarization';
import VoiceLibrary from './pages/VoiceLibrary';
import GlobalPlayer from './components/GlobalPlayer';
import { PlayerProvider } from './contexts/PlayerContext';
import { TTSProvider } from './contexts/TTSContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Page } from './types';
import { Globe, ChevronDown } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const { lang, setLang } = useLanguage();

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home onNavigate={setCurrentPage} />;
      case Page.ASR:
        return <ASR />;
      case Page.TTS:
        return <TTS />;
      case Page.VOICE_CLONING:
        return <VoiceCloning />;
      case Page.DIARIZATION:
        return <Diarization />;
      // All library pages use the same component but pass different initial tabs
      case Page.DISCOVER:
      case Page.PRESET:
      case Page.CUSTOM:
      case Page.FAVORITES:
        return <VoiceLibrary onNavigate={setCurrentPage} initialTab={currentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-spark-bg text-white font-sans selection:bg-spark-accent/40 selection:text-white overflow-hidden relative">
      
      {/* --- NEW BACKGROUND LOGIC START --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Base Dark Gradient to give slight depth from top-left */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050a1f] via-[#020204] to-[#020204]" />

          {/* Large, slow breathing ambient lights (Fixed positions, no movement around screen) */}
          {/* Top Left: Deep Blue/Purple */}
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-spark-dark/20 blur-[100px] animate-pulse-slow mix-blend-screen" />
          
          {/* Bottom Right: Cyan Accent */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-spark-accent/10 blur-[120px] animate-pulse-slow mix-blend-screen" style={{ animationDelay: '3s' }} />

          {/* Dot Pattern Overlay - Provides texture and sharpness */}
          <div className="absolute inset-0 bg-dot-pattern opacity-30" />

          {/* Noise Layer - Subtle texture */}
          <div className="bg-noise mix-blend-overlay"></div>
      </div>
      {/* --- NEW BACKGROUND LOGIC END --- */}

      {/* --- NEW TOP NAVIGATION BAR START --- */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-6 border-b border-white/10 bg-[#020204]/90 backdrop-blur-2xl">
         {/* Logo Section (Moved from Sidebar) */}
         <div className="flex items-center gap-3 w-64">
            <div className="w-8 h-8 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] overflow-hidden border border-white/10">
              <img 
                src="https://github.com/mattyyyyyyy/picture2bed/blob/main/e850352ac65c103853436eb801478413b07eca802308%20(1).png?raw=true" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-base font-bold tracking-wide text-white drop-shadow-[0_0_12px_rgba(59,130,246,1.0)]">
              JDO AI Speech
            </div>
         </div>

         {/* Language Switcher (Moved from Main content) */}
         <div className="relative group flex items-center">
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
              <Globe size={12} className="text-white group-hover:text-spark-accent transition-colors" />
            </div>
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value as 'EN' | 'CN')}
              className="appearance-none bg-spark-surface/80 border border-white/10 hover:border-white/30 rounded-full pl-8 pr-7 py-0 text-xs font-bold text-white outline-none cursor-pointer transition-all shadow-sm focus:ring-1 focus:ring-spark-accent/50 backdrop-blur-md h-[24px] leading-[22px] flex items-center"
            >
              <option value="CN" className="bg-spark-bg text-white">中文</option>
              <option value="EN" className="bg-spark-bg text-white">English</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown size={12} className="text-white/70" />
            </div>
         </div>
      </header>
      {/* --- NEW TOP NAVIGATION BAR END --- */}

      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Main Content Area Adjusted: mt-16 for top bar, height minus top bar */}
      <main className="ml-72 mt-16 h-[calc(100vh-4rem)] p-8 relative z-10 flex flex-col box-border">
        {/* Old Header Removed */}

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          {renderPage()}
        </div>
        
        <GlobalPlayer />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <PlayerProvider>
        <VoiceProvider>
          <TTSProvider>
            <AppContent />
          </TTSProvider>
        </VoiceProvider>
      </PlayerProvider>
    </LanguageProvider>
  );
};

export default App;