
import React from 'react';
import { User, Globe, Star, PenTool } from 'lucide-react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const PromptSidebar: React.FC<PromptSidebarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  
  const items = [
    { id: Page.PROMPT_DISCOVER, label: t('prompt_nav_home'), icon: Globe },
    { id: Page.PROMPT_FAVORITES, label: t('prompt_nav_favorites'), icon: Star },
    { id: Page.PROMPT_MINE, label: t('prompt_nav_mine'), icon: User },
  ];

  return (
    <aside className="w-72 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 flex flex-col glass-panel border-r border-white/10 bg-[#020204]/80 backdrop-blur-2xl">
      <div className="flex-1 px-4 py-8 flex flex-col gap-2">
        <div className="space-y-1 mb-8">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-bold border
                  ${isActive 
                    ? 'bg-spark-accent/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] border-white/10' 
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-spark-accent' : 'text-white/40 group-hover:text-white'} /> {item.label}
              </button>
            )
          })}
        </div>

        {/* Compose button with gradient effect */}
        <button 
          onClick={() => onNavigate(Page.PROMPT_CREATE)}
          className={`
            w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl font-black text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
            bg-gradient-to-r from-spark-accent via-spark-accent to-indigo-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] border border-white/20
          `}
        >
          <PenTool size={18} /> {t('prompt_nav_create')}
        </button>
      </div>
    </aside>
  );
};

export default PromptSidebar;
