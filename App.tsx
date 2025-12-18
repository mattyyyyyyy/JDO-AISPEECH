
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';

// AI Voice Module Components
import Home from './pages/voice/Home';
import ASR from './pages/voice/ASR';
import TTS from './pages/voice/TTS';
import VoiceCloning from './pages/voice/VoiceCloning';
import Diarization from './pages/voice/Diarization';
import VoiceLibrary from './pages/voice/VoiceLibrary';
import VoiceSidebar from './pages/voice/components/VoiceSidebar';
import VoicePlayer from './pages/voice/components/VoicePlayer';

// Digital Human Module Page
import DigitalHuman from './pages/digital-human/DigitalHumanPage';

// Prompt Engine Module Components
import PromptDiscover from './pages/prompts/PromptDiscover';
import PromptFavorites from './pages/prompts/PromptFavorites';
import PromptMine from './pages/prompts/PromptMine';
import PromptCreate from './pages/prompts/PromptCreate';
import PromptSidebar from './pages/prompts/components/PromptSidebar';

import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { TTSProvider } from './contexts/TTSContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModuleProvider, useModule } from './contexts/ModuleContext';
import { Page, AppModule } from './types';

const AppContent: React.FC = () => {
  const { currentModule } = useModule();
  const { closePlayer } = usePlayer();
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);

  // Stop any active playback when switching top-level modules
  useEffect(() => {
    closePlayer();
    
    // Set default sub-page when switching modules
    if (currentModule === AppModule.AI_VOICE) {
      setCurrentPage(Page.HOME);
    } else if (currentModule === AppModule.PROMPT_LIBRARY) {
      setCurrentPage(Page.PROMPT_DISCOVER);
    }
  }, [currentModule, closePlayer]);

  const renderAiVoiceModule = () => {
    const renderSubPage = () => {
      switch (currentPage) {
        case Page.HOME: return <Home onNavigate={setCurrentPage} />;
        case Page.ASR: return <ASR />;
        case Page.TTS: return <TTS />;
        case Page.VOICE_CLONING: return <VoiceCloning />;
        case Page.DIARIZATION: return <Diarization />;
        case Page.DISCOVER:
        case Page.PRESET:
        case Page.CUSTOM:
        case Page.FAVORITES:
          return <VoiceLibrary onNavigate={setCurrentPage} initialTab={currentPage} />;
        default: return <Home onNavigate={setCurrentPage} />;
      }
    };

    return (
      <>
        <VoiceSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="relative z-10 flex flex-col ml-72 p-8 mt-20 h-[calc(100vh-5rem)]">
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderSubPage()}
          </div>
          <VoicePlayer />
        </main>
      </>
    );
  };

  const renderPromptModule = () => {
    const renderSubPage = () => {
      switch (currentPage) {
        case Page.PROMPT_DISCOVER: return <PromptDiscover onNavigate={setCurrentPage} />;
        case Page.PROMPT_FAVORITES: return <PromptFavorites onNavigate={setCurrentPage} />;
        case Page.PROMPT_MINE: return <PromptMine onNavigate={setCurrentPage} />;
        case Page.PROMPT_CREATE: return <PromptCreate onNavigate={setCurrentPage} />;
        default: return <PromptDiscover onNavigate={setCurrentPage} />;
      }
    };

    return (
      <>
        <PromptSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="relative z-10 flex flex-col ml-72 p-8 mt-20 h-[calc(100vh-5rem)]">
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderSubPage()}
          </div>
        </main>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-spark-bg text-white font-sans selection:bg-spark-accent/40 selection:text-white overflow-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#050a1f] via-[#020204] to-[#020204]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-spark-dark/20 blur-[100px] animate-pulse-slow mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-spark-accent/10 blur-[120px] animate-pulse-slow mix-blend-screen" />
          <div className="absolute inset-0 bg-dot-pattern opacity-30" />
          <div className="bg-noise mix-blend-overlay"></div>
      </div>

      <Navbar />

      {currentModule === AppModule.AI_VOICE && renderAiVoiceModule()}
      {currentModule === AppModule.PROMPT_LIBRARY && renderPromptModule()}
      {currentModule === AppModule.DIGITAL_HUMAN && (
        <main className="relative z-10 w-full h-screen">
          <DigitalHuman />
        </main>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ModuleProvider>
        <PlayerProvider>
          <VoiceProvider>
            <TTSProvider>
              <AppContent />
            </TTSProvider>
          </VoiceProvider>
        </PlayerProvider>
      </ModuleProvider>
    </LanguageProvider>
  );
};

export default App;
