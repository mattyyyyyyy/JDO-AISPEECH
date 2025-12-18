import React, { useState, memo, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useModule } from '../contexts/ModuleContext';
import { AppModule } from '../types';

const JDOLogo = memo(() => (
  <div className="flex items-center gap-3">
    <img 
      src="https://github.com/mattyyyyyyy/picture2bed/blob/main/e850352ac65c103853436eb801478413b07eca802308%20(1).png?raw=true" 
      alt="JDO Logo" 
      className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
    />
    <span 
      className="font-sans font-black text-2xl text-white tracking-tighter drop-shadow-md select-none leading-none pt-0.5"
    >
      JDO
    </span>
  </div>
));

const Navbar: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { currentModule, setModule } = useModule();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangMenuOpen(false);
        }
    };
    if (isLangMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangMenuOpen]);

  // Top Menu Items - Architecture Definition
  const menuItems = [
    { id: AppModule.DIGITAL_HUMAN, label: lang === 'CN' ? '数字人' : 'Digital Human' },
    { id: AppModule.AI_VOICE, label: lang === 'CN' ? 'AI语音' : 'AI Voice' },
    { id: AppModule.PROMPT_LIBRARY, label: lang === 'CN' ? '提示词引擎' : 'Prompt Engine' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-6 md:px-10 border-b border-white/5 bg-[#020204]/10 backdrop-blur-xl transition-all duration-300">
      {/* Left: Logo - Resets to Core Module (Digital Human) */}
      <div className="flex items-center gap-3 select-none min-w-[200px] h-full cursor-pointer" onClick={() => setModule(AppModule.DIGITAL_HUMAN)}>
         <JDOLogo />
      </div>
      
      {/* Center: Main Menu (Module Switcher) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-8 h-full z-50 select-none">
         {menuItems.map((item, index) => {
           const isActive = currentModule === item.id;
           return (
             <React.Fragment key={item.id}>
                <button 
                  onClick={() => setModule(item.id)}
                  className={`text-[16px] font-bold tracking-wide transition-all duration-300 leading-none ${
                    isActive 
                      ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] scale-105' 
                      : 'text-white/50 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                  }`}
                >
                  {item.label}
                </button>
                {/* Separator */}
                {index < menuItems.length - 1 && <div className="w-[1px] h-3.5 bg-white/10 rounded-full" />}
             </React.Fragment>
           );
         })}
      </div>
      
      {/* Right: Language Switcher */}
      <div className="relative z-50 flex items-center justify-end gap-4 min-w-[200px]" ref={langMenuRef}>
        <div className="relative">
          <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors opacity-90 hover:opacity-100 select-none px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
          >
              <Globe size={16} />
              <span>{lang === 'CN' ? '简体中文' : 'English'}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
                  <button
                  onClick={() => { setLang('CN'); setIsLangMenuOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg transition-colors ${lang === 'CN' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                  简体中文
                  {lang === 'CN' && <Check size={12} className="text-green-400" />}
                  </button>
                  <button
                  onClick={() => { setLang('EN'); setIsLangMenuOpen(false); }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg transition-colors ${lang === 'EN' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                  English
                  {lang === 'EN' && <Check size={12} className="text-green-400" />}
                  </button>
              </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;