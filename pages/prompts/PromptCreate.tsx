
import React, { useState, useRef } from 'react';
import { Save, Info, Image as ImageIcon, UploadCloud, CheckCircle } from 'lucide-react';
import { Page, PromptItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PromptCreateProps {
  onNavigate: (page: Page) => void;
}

const PromptCreate: React.FC<PromptCreateProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('学术/教师');
  const [model, setModel] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!title || !content) return;
    onNavigate(Page.PROMPT_MINE);
  };

  const translateCat = (cat: string) => {
    switch(cat) {
      case '学术/教师': return t('prompt_cat_academic');
      case '写作辅助': return t('prompt_cat_writing');
      case '文章/报告': return t('prompt_cat_report');
      case 'IT/编程': return t('prompt_cat_coding');
      case 'AI': return t('prompt_cat_ai');
      case '新闻': return t('prompt_cat_news');
      default: return cat;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0 py-2 mb-6 border-b border-white/10 min-h-[50px]">
        <h1 className="text-2xl font-black text-white">{t('prompt_create_title')}</h1>
      </div>
      
      <div className="max-w-5xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 pb-20 animate-in slide-in-from-bottom-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{t('prompt_field_title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#161618] border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none text-base font-bold shadow-inner" placeholder={t('prompt_placeholder_title')} />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{t('prompt_field_category')}</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full bg-[#161618] border border-white/10 rounded-2xl px-5 py-4 text-white appearance-none outline-none focus:border-indigo-500 text-base font-bold shadow-inner cursor-pointer">
              {['学术/教师', '写作辅助', '文章/报告', 'IT/编程', 'AI', '新闻'].map(f => <option key={f} value={f}>{translateCat(f)}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2"><ImageIcon size={14}/> {t('prompt_field_image')}</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[16/9] bg-[#161618] border border-dashed border-white/20 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] hover:border-indigo-500 transition-all overflow-hidden shadow-inner group"
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              {imagePreview ? (
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <UploadCloud className="text-white/20 mb-4 group-hover:text-indigo-400 transition-colors" size={48} />
                  <span className="text-sm font-bold text-white/30">{t('prompt_placeholder_image')}</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-8 flex flex-col">
            <div className="space-y-3">
              <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2"><ImageIcon size={14}/> {t('prompt_field_model')}</label>
              <input value={model} onChange={e => setModel(e.target.value)} className="w-full bg-[#161618] border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none text-base shadow-inner" placeholder={t('prompt_placeholder_model')} />
            </div>
            <div className="space-y-3 flex-1 flex flex-col">
              <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2"><Info size={14}/> {t('prompt_field_notes')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full flex-1 bg-[#161618] border border-white/10 rounded-2xl p-5 text-white text-base font-light leading-relaxed focus:border-indigo-500 outline-none resize-none shadow-inner" placeholder={t('prompt_placeholder_notes')} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{t('prompt_field_content')}</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full h-96 bg-[#161618] border border-white/10 rounded-[2rem] p-8 text-lg text-white font-light leading-relaxed focus:border-indigo-500 outline-none resize-none shadow-inner scrollbar-hide" placeholder={t('prompt_placeholder_content')} />
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-white/10">
          <button onClick={() => setIsPublic(!isPublic)} className="flex items-center gap-3 text-base font-bold text-white/50 hover:text-white transition-all group">
            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${isPublic ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/20'}`}>{isPublic && <CheckCircle size={18}/>}</div>
            公开分享到社区
          </button>

          <div className="flex gap-6">
            <button onClick={() => onNavigate(Page.PROMPT_MINE)} className="px-8 py-3 rounded-xl font-bold text-white/40 hover:text-white text-base transition-colors">取消</button>
            <button onClick={handleSubmit} disabled={!title || !content} className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-2xl disabled:opacity-30 flex items-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] transition-all"><Save size={22}/> 保存</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCreate;
