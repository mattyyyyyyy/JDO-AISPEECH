import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Mic, Speaker, Copy, Users, Library, Globe, User, Heart, Activity, Settings, X, Plus, Trash2, Tag, Volume2 } from 'lucide-react';
import { Page } from '../types';
import { NAV_GROUPS } from '../constants';
import { useVoices } from '../contexts/VoiceContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { voices, deleteVoice, tags, addTag, removeTag } = useVoices();
  const { t } = useLanguage();
  
  // Settings Tabs
  const [activeSettingsTab, setActiveSettingsTab] = useState<'tags' | 'voices'>('tags');
  const [newTagInput, setNewTagInput] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Globe': return Globe;
      case 'Library': return Library;
      case 'User': return User;
      case 'Heart': return Heart;
      case 'Mic': return Mic;
      case 'Speaker': return Speaker;
      case 'Copy': return Copy;
      case 'Users': return Users;
      default: return Activity;
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      addTag(newTagInput.trim());
      setNewTagInput('');
    }
  };

  const handleDeleteVoice = (id: string) => {
    if (confirm('确定要删除这个声音模型吗？此操作无法撤销。')) {
      deleteVoice(id);
    }
  };
  
  // Mapping for translation keys based on ids or structure
  const getTranslationKey = (id: string): any => {
    switch(id) {
        case 'main_menu': return 'main_menu';
        case 'library': return 'library';
        case 'capabilities': return 'capabilities';
        case Page.HOME: return 'home';
        case Page.DISCOVER: return 'discover';
        case Page.PRESET: return 'preset';
        case Page.CUSTOM: return 'custom';
        case Page.FAVORITES: return 'favorites';
        case Page.ASR: return 'asr';
        case Page.TTS: return 'tts';
        case Page.VOICE_CLONING: return 'voice_cloning';
        case Page.DIARIZATION: return 'diarization';
        default: return id;
    }
  };

  return (
    <>
    {/* Sidebar Adjusted: top-20 (80px) to sit below taller header, height calc(100vh - 5rem) */}
    <aside className="w-72 h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 flex flex-col glass-panel border-r border-white/10 bg-[#020204]/80 backdrop-blur-2xl">
      {/* Logo Removed from here */}

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {NAV_GROUPS.map((group, idx) => {
          return (
            <div key={idx}>
              {group.title !== '主菜单' && (
                <div className="text-[10px] font-bold text-white/50 px-4 mb-3 uppercase tracking-[0.2em]">
                  {t(getTranslationKey(group.id))}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = getIcon(item.icon);
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id as Page)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative border
                        ${isActive 
                          ? 'bg-spark-accent/20 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] border-white/10' 
                          : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      <Icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                      {t(getTranslationKey(item.id))}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
           onClick={() => setShowSettings(true)}
           className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
           <Settings size={18} />
           <span className="text-sm font-medium">{t('global_settings')}</span>
        </button>
      </div>
    </aside>

    {/* Settings Modal */}
    {showSettings && createPortal(
       <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowSettings(false)}></div>
          <div className="relative w-[600px] h-[70vh] bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
             {/* Header */}
             <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#161618]">
                <h3 className="text-lg font-bold text-white">管理中心</h3>
                <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
             </div>
             
             {/* Tabs */}
             <div className="px-6 border-b border-white/5 flex gap-6 bg-[#161618]/50">
                 <button 
                   onClick={() => setActiveSettingsTab('tags')}
                   className={`py-4 text-sm font-bold border-b-2 transition-all ${activeSettingsTab === 'tags' ? 'border-spark-accent text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                 >
                   标签管理
                 </button>
                 <button 
                   onClick={() => setActiveSettingsTab('voices')}
                   className={`py-4 text-sm font-bold border-b-2 transition-all ${activeSettingsTab === 'voices' ? 'border-spark-accent text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                 >
                   声音库管理
                 </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f11]">
                
                {activeSettingsTab === 'tags' && (
                  <div className="space-y-6">
                     <div className="flex gap-2">
                        <input 
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          placeholder="输入新标签名称..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-spark-accent"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <button 
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-spark-accent rounded-lg text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                        >
                          添加
                        </button>
                     </div>

                     <div>
                        <h4 className="text-xs text-white/40 font-bold uppercase mb-3">现有标签</h4>
                        <div className="flex flex-wrap gap-2">
                           {tags.map(tag => (
                             <div key={tag} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-sm text-white/80 hover:bg-white/10">
                                <span>{tag}</span>
                                <button onClick={() => removeTag(tag)} className="text-white/20 hover:text-red-400">
                                  <X size={14} />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

                {activeSettingsTab === 'voices' && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white/40 font-bold uppercase">所有声音模型 ({voices.length})</span>
                        <button 
                          onClick={() => { setShowSettings(false); onNavigate(Page.VOICE_CLONING); }}
                          className="flex items-center gap-1 text-xs text-spark-accent hover:underline"
                        >
                          <Plus size={12} /> 新增声音
                        </button>
                     </div>
                     
                     <div className="space-y-2">
                        {voices.map(voice => (
                           <div key={voice.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
                              <img src={voice.avatarUrl} className="w-10 h-10 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                 <div className="text-sm font-bold text-white truncate">{voice.name}</div>
                                 <div className="text-xs text-white/40">{voice.isCustom ? '自定义' : '系统预设'}</div>
                              </div>
                              <button 
                                onClick={() => handleDeleteVoice(voice.id)}
                                className="p-2 rounded-lg text-white/20 hover:bg-white/5 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

             </div>
          </div>
       </div>,
       document.body
    )}
    </>
  );
};

export default Sidebar;