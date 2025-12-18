
import React from 'react';
import PromptListContainer from './components/PromptListContainer';
import { Page } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PromptFavoritesProps {
  onNavigate: (page: Page) => void;
}

const PromptFavorites: React.FC<PromptFavoritesProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0 py-1 mb-4 border-b border-white/5 min-h-[40px]">
        <h1 className="text-lg font-bold text-white">{t('prompt_favorites_title')}</h1>
        <div className="flex bg-[#161618] border border-white/5 rounded-lg p-0.5">
          {[
            { id: Page.PROMPT_DISCOVER, label: '社区' },
            { id: Page.PROMPT_FAVORITES, label: '收藏' },
            { id: Page.PROMPT_MINE, label: '我的' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${Page.PROMPT_FAVORITES === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <PromptListContainer type="favorites" emptyText={t('prompt_empty_fav')} />
    </div>
  );
};

export default PromptFavorites;
